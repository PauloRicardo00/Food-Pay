using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodPay.API.Data;
using FoodPay.API.Models;

namespace FoodPay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriasController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var categorias = await _context.Categorias.ToListAsync();

            return Ok(categorias);
        }

        [HttpPost]
        public async Task<IActionResult> Cadastrar(Categoria categoria)
        {
            _context.Categorias.Add(categoria);

            await _context.SaveChangesAsync();

            return Ok(categoria);
        }
    }
}