using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodPay.API.Data;
using FoodPay.API.Models;

namespace FoodPay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItensPedidoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ItensPedidoController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var itens = await _context.ItensPedido.ToListAsync();

            return Ok(itens);
        }

        [HttpPost]
        public async Task<IActionResult> Cadastrar(ItemPedido item)
        {
            item.Subtotal = item.PrecoUnitario * item.Quantidade;

            _context.ItensPedido.Add(item);

            await _context.SaveChangesAsync();

            return Ok(item);
        }
    }
}