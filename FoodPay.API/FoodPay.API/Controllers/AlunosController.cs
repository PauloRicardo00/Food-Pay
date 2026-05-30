using FoodPay.API.Data;
using FoodPay.API.DTOs;
using FoodPay.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FoodPay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlunosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AlunosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var alunos = await _context.Alunos
                .Select(a => new AlunoDTO
                {
                    Id = a.Id,
                    Nome = a.Nome,
                    Saldo = a.Saldo,
                    LimiteDiario = a.LimiteDiario,
                    Ativo = a.Ativo
                })
                .ToListAsync();

            return Ok(alunos);
        }

        [Authorize]
        [HttpGet("/api/aluno/dashboard")]
        public async Task<IActionResult> Dashboard()
        {
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;

            var aluno = await _context.Alunos
                .FirstOrDefaultAsync(a => a.Email == emailUsuario);

            if (aluno == null)
                return Unauthorized("Aluno não encontrado.");

            return Ok(new
            {
                aluno = new
                {
                    id = aluno.Id,
                    nome = aluno.Nome,
                    saldo = aluno.Saldo,
                    limiteDiario = aluno.LimiteDiario,
                    ativo = aluno.Ativo
                },

                cardapio = await _context.Produtos
                    .Where(p => p.Disponivel == true)
                    .ToListAsync(),

                pedidosRecentes = await _context.Pedidos
                    .Where(p => p.AlunoId == aluno.Id)
                    .OrderByDescending(p => p.DataPedido)
                    .Take(5)
                    .ToListAsync(),

                transacoes = await _context.TransacoesFinanceiras
                    .Where(t => t.AlunoId == aluno.Id)
                    .OrderByDescending(t => t.DataTransacao)
                    .Take(5)
                    .ToListAsync()
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> BuscarPorId(int id)
        {
            var aluno = await _context.Alunos.FindAsync(id);

            if (aluno == null)
                return NotFound("Aluno não encontrado.");

            return Ok(aluno);
        }

        [HttpPost]
        public async Task<IActionResult> Cadastrar(Aluno aluno)
        {
            aluno.Ativo = true;
            aluno.DataCriacao = DateTime.Now;

            aluno.SenhaHash = BCrypt.Net.BCrypt.HashPassword(aluno.SenhaHash);

            _context.Alunos.Add(aluno);

            await _context.SaveChangesAsync();

            return Ok(aluno);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Atualizar(int id, Aluno alunoAtualizado)
        {
            var aluno = await _context.Alunos.FindAsync(id);

            if (aluno == null)
                return NotFound("Aluno não encontrado.");

            aluno.Nome = alunoAtualizado.Nome;
            aluno.Email = alunoAtualizado.Email;
            aluno.SenhaHash = alunoAtualizado.SenhaHash;
            aluno.Saldo = alunoAtualizado.Saldo;
            aluno.LimiteDiario = alunoAtualizado.LimiteDiario;
            aluno.Ativo = alunoAtualizado.Ativo;

            await _context.SaveChangesAsync();

            return Ok(aluno);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Excluir(int id)
        {
            var aluno = await _context.Alunos.FindAsync(id);

            if (aluno == null)
                return NotFound("Aluno não encontrado.");

            _context.Alunos.Remove(aluno);
            await _context.SaveChangesAsync();

            return Ok("Aluno excluído com sucesso.");
        }
    }
}