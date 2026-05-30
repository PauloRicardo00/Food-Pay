using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodPay.API.Data;
using FoodPay.API.Models;

namespace FoodPay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ResponsaveisController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ResponsaveisController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var responsaveis = await _context.Responsaveis.ToListAsync();

            return Ok(responsaveis);
        }

        [HttpPost]
        public async Task<IActionResult> Cadastrar(Responsavel responsavel)
        {
            responsavel.Ativo = true;
            responsavel.DataCriacao = DateTime.Now;
            responsavel.SenhaHash = BCrypt.Net.BCrypt.HashPassword(responsavel.SenhaHash);

            _context.Responsaveis.Add(responsavel);
            await _context.SaveChangesAsync();

            return Ok(responsavel);
        }
    }
}