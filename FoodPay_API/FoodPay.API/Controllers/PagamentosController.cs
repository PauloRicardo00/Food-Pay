using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodPay.API.Data;
using FoodPay.API.Models;
using FoodPay.API.DTOs;
using Stripe;
using Stripe.Checkout;
using Microsoft.AspNetCore.Authorization;
using FoodPay.API.Services;

namespace FoodPay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PagamentosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly StripeRecargaService _stripeRecargaService;

        public PagamentosController(
            AppDbContext context,
            IConfiguration configuration,
            StripeRecargaService stripeRecargaService)
        {
            _context = context;
            _configuration = configuration;
            _stripeRecargaService = stripeRecargaService;
        }

        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var perfil = User.FindFirst("perfil")?.Value;

            if (perfil != "funcionario")
                return Forbid();

            var pagamentos = await _context.Pagamentos.ToListAsync();
            return Ok(pagamentos);
        }

        [HttpPost]
        public async Task<IActionResult> Cadastrar(Pagamento pagamento)
        {
            var perfil = User.FindFirst("perfil")?.Value;

            if (perfil != "funcionario")
                return Forbid();

            pagamento.DataPagamento = DateTime.Now;

            _context.Pagamentos.Add(pagamento);
            await _context.SaveChangesAsync();

            return Ok(pagamento);
        }

        [HttpPost("criar-checkout")]
        public async Task<IActionResult> CriarCheckout(CriarCheckoutDTO dto)
        {
            try
            {
                var session = await _stripeRecargaService.CriarCheckoutAsync(User, dto);

                return Ok(new
                {
                    url = session.Url
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (StripeException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("confirmar-checkout/{sessionId}")]
        public async Task<IActionResult> ConfirmarCheckout(string sessionId)
        {
            try
            {
                var resultado = await _stripeRecargaService.ConfirmarCheckoutAsync(User, sessionId);

                return Ok(new
                {
                    processado = resultado.FoiProcessado,
                    mensagem = resultado.Mensagem
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ex.Message);
            }
            catch (StripeException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [AllowAnonymous]
        [HttpPost("webhook")]
        public async Task<IActionResult> Webhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var webhookSecret = _configuration["Stripe:WebhookSecret"];

            if (string.IsNullOrWhiteSpace(webhookSecret))
                return BadRequest("Stripe:WebhookSecret não configurado.");

            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    json,
                    Request.Headers["Stripe-Signature"],
                    webhookSecret,
                    throwOnApiVersionMismatch: false
                );

                if (stripeEvent.Type == "checkout.session.completed")
                {
                    var session = stripeEvent.Data.Object as Session;

                    if (session == null)
                        return Ok();

                    var resultado = await _stripeRecargaService.ProcessarCheckoutConcluidoAsync(session);
                    Console.WriteLine(resultado.Mensagem);
                }

                return Ok();
            }
            catch (StripeException ex)
            {
                Console.WriteLine($"Erro Stripe webhook: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro webhook: {ex.Message}");
                return BadRequest(ex.Message);
            }
        }
    }
}
