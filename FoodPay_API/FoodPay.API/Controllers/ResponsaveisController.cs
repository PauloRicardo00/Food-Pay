using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using FoodPay.API.Data;
using FoodPay.API.DTOs;
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

        // Apenas funcionários podem listar todos os responsáveis
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var perfil = User.FindFirst("perfil")?.Value;

            if (perfil != "funcionario")
                return Forbid();

            var responsaveis = await _context.Responsaveis
                .Select(r => new ResponsavelRespostaDTO
                {
                    Id = r.Id,
                    Nome = r.Nome,
                    Email = r.Email,
                    Telefone = r.Telefone,
                    Ativo = r.Ativo,
                    DataCriacao = r.DataCriacao
                })
                .ToListAsync();

            return Ok(responsaveis);
        }

        // Cadastro é público (registro de novo responsável)
        [HttpPost]
        public async Task<IActionResult> Cadastrar(Responsavel responsavel)
        {
            if (string.IsNullOrWhiteSpace(responsavel.SenhaHash) || responsavel.SenhaHash.Length < 6)
            {
                return BadRequest(new { mensagem = "A senha deve possuir pelo menos 6 caracteres." });
            }

            responsavel.Ativo = true;
            responsavel.DataCriacao = DateTime.Now;
            responsavel.SenhaHash = BCrypt.Net.BCrypt.HashPassword(responsavel.SenhaHash);

            _context.Responsaveis.Add(responsavel);
            await _context.SaveChangesAsync();

            return Ok(new ResponsavelRespostaDTO
            {
                Id = responsavel.Id,
                Nome = responsavel.Nome,
                Email = responsavel.Email,
                Telefone = responsavel.Telefone,
                Ativo = responsavel.Ativo,
                DataCriacao = responsavel.DataCriacao
            });
        }
    }
}
