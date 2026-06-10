using FoodPay.API.DTOs;
using FoodPay.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace FoodPay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StripeController : ControllerBase
    {
        private readonly StripeRecargaService _stripeRecargaService;

        public StripeController(StripeRecargaService stripeRecargaService)
        {
            _stripeRecargaService = stripeRecargaService;
        }

        // Endpoint legado mantido apenas para não quebrar telas antigas do frontend.
        // O fluxo oficial de recarga é POST /api/Pagamentos/criar-checkout.
        [Authorize]
        [HttpPost("criar-checkout")]
        public async Task<IActionResult> CriarCheckoutLegado([FromBody] CriarCheckoutDTO dto)
        {
            Response.Headers.Append("X-FoodPay-Deprecated", "Use POST /api/Pagamentos/criar-checkout");

            try
            {
                var session = await _stripeRecargaService.CriarCheckoutAsync(User, dto);

                return Ok(new
                {
                    url = session.Url,
                    aviso = "Endpoint legado. Atualize o frontend para usar /api/Pagamentos/criar-checkout."
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

        // Webhook duplicado desativado para impedir crédito duplo.
        // Configure o painel da Stripe para chamar somente POST /api/Pagamentos/webhook.
        [AllowAnonymous]
        [HttpPost("webhook")]
        public IActionResult WebhookDesativado()
        {
            return StatusCode(StatusCodes.Status410Gone,
                "Webhook legado desativado. Configure a Stripe para usar POST /api/Pagamentos/webhook.");
        }
    }
}
