using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodPay.API.Data;
using FoodPay.API.Models;
using FoodPay.API.DTOs;
using Stripe;
using Stripe.Checkout;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Globalization;

namespace FoodPay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PagamentosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public PagamentosController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var pagamentos = await _context.Pagamentos.ToListAsync();
            return Ok(pagamentos);
        }

        [HttpPost]
        public async Task<IActionResult> Cadastrar(Pagamento pagamento)
        {
            pagamento.DataPagamento = DateTime.Now;

            _context.Pagamentos.Add(pagamento);
            await _context.SaveChangesAsync();

            return Ok(pagamento);
        }

        [HttpPost("criar-checkout")]
        public IActionResult CriarCheckout(CriarCheckoutDTO dto)
        {
            var valorEmCentavos = (long)(dto.Valor * 100);

            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;

            var aluno = _context.Alunos.FirstOrDefault(a => a.Email == emailUsuario);

            if (aluno == null)
                return Unauthorized("Aluno não encontrado.");

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },

                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "brl",
                            UnitAmount = valorEmCentavos,
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = "Recarga FoodPay"
                            }
                        },
                        Quantity = 1
                    }
                },

                Metadata = new Dictionary<string, string>
                {
                    { "alunoId", aluno.Id.ToString() },
                    { "valor", dto.Valor.ToString(CultureInfo.InvariantCulture) }
                },

                Mode = "payment",
                SuccessUrl = _configuration["Stripe:SuccessUrl"],
                CancelUrl = _configuration["Stripe:CancelUrl"]
            };

            var service = new SessionService();
            var session = service.Create(options);

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
                        return BadRequest("Metadata não encontrada.");

                    var alunoId = int.Parse(session.Metadata["alunoId"]);
                    var valor = decimal.Parse(session.Metadata["valor"], CultureInfo.InvariantCulture);

                    var aluno = await _context.Alunos.FindAsync(alunoId);

                    if (aluno == null)
                        return BadRequest("Aluno não encontrado.");

                    aluno.Saldo += valor;

                    var transacao = new TransacaoFinanceira
                    {
                        AlunoId = aluno.Id,
                        Tipo = "RECARGA",
                        Valor = valor,
                        Descricao = "Recarga via Stripe",
                        DataTransacao = DateTime.Now
                    };

                    _context.TransacoesFinanceiras.Add(transacao);

                    await _context.SaveChangesAsync();

                    Console.WriteLine($"Saldo atualizado para o aluno {aluno.Id}. Valor: {valor}");
                }

                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return BadRequest(ex.Message);
            }
        }
    }
}