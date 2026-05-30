using FoodPay.API.Data;
using FoodPay.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;

namespace FoodPay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StripeController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public StripeController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [Authorize]
        [HttpPost("criar-checkout")]
        public async Task<IActionResult> CriarCheckout([FromBody] CriarCheckoutDTO dto)
        {
            if (dto.AlunoId <= 0)
                return BadRequest("Aluno inválido.");

            if (dto.Valor <= 0)
                return BadRequest("Valor inválido.");

            var aluno = await _context.Alunos.FindAsync(dto.AlunoId);

            if (aluno == null)
                return NotFound("Aluno não encontrado.");

            var valorCentavos = (long)(dto.Valor * 100);

            var options = new SessionCreateOptions
            {
                Mode = "payment",
                SuccessUrl = _configuration["Stripe:SuccessUrl"],
                CancelUrl = _configuration["Stripe:CancelUrl"],

                PaymentMethodTypes = new List<string>
                {
                    "card"
                },

                Metadata = new Dictionary<string, string>
                {
                    { "alunoId", aluno.Id.ToString() },
                    { "valor", dto.Valor.ToString("F2") }
                },

                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        Quantity = 1,
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "brl",
                            UnitAmount = valorCentavos,
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = $"Recarga Food Pay - {aluno.Nome}"
                            }
                        }
                    }
                }
            };

            var service = new SessionService();
            var session = await service.CreateAsync(options);

            return Ok(new
            {
                url = session.Url
            });
        }

        [AllowAnonymous]
        [HttpPost("webhook")]
        public async Task<IActionResult> Webhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    json,
                    Request.Headers["Stripe-Signature"],
                    _configuration["Stripe:WebhookSecret"],
                    throwOnApiVersionMismatch: false
                );

                if (stripeEvent.Type == "checkout.session.completed")
                {
                    var session = stripeEvent.Data.Object as Session;

                    if (session?.Metadata == null)
                        return Ok();

                    var alunoId = int.Parse(session.Metadata["alunoId"]);
                    var valor = decimal.Parse(session.Metadata["valor"]);

                    var aluno = await _context.Alunos.FindAsync(alunoId);

                    if (aluno == null)
                        return Ok();

                    var jaExiste = await _context.TransacoesFinanceiras
                        .AnyAsync(t => t.Descricao == $"Recarga Stripe {session.Id}");

                    if (jaExiste)
                        return Ok();

                    aluno.Saldo += valor;

                    _context.Notificacoes.Add(new Notificacao
                    {
                        AlunoId = aluno.Id,
                        Mensagem = $"Saldo atualizado com sucesso. Valor recarregado: R$ {valor:F2}.",
                        Lida = false,
                        DataEnvio = DateTime.Now
                    });

                    var transacao = new TransacaoFinanceira
                    {
                        AlunoId = aluno.Id,
                        Tipo = "RECARGA",
                        Valor = valor,
                        Descricao = $"Recarga Stripe {session.Id}",
                        DataTransacao = DateTime.Now
                    };

                    _context.TransacoesFinanceiras.Add(transacao);

                    await _context.SaveChangesAsync();
                }

                return Ok();
            }
            catch (StripeException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }

    public class CriarCheckoutDTO
    {
        public int AlunoId { get; set; }

        public decimal Valor { get; set; }
    }
}