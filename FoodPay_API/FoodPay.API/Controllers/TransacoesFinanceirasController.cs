using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using FoodPay.API.Data;
using FoodPay.API.Models;

namespace FoodPay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TransacoesFinanceirasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransacoesFinanceirasController(AppDbContext context)
        {
            _context = context;
        }

        // Aluno vê apenas as próprias transações
        [HttpGet("minhas")]
        public async Task<IActionResult> MinhasTransacoes()
        {
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;
            var perfil = User.FindFirst("perfil")?.Value;

            if (perfil != "aluno")
                return Forbid();

            var aluno = await _context.Alunos
                .FirstOrDefaultAsync(a => a.Email == emailUsuario);

            if (aluno == null)
                return Unauthorized("Aluno não encontrado.");

            var transacoes = await _context.TransacoesFinanceiras
                .Where(t => t.AlunoId == aluno.Id)
                .OrderByDescending(t => t.DataTransacao)
                .ToListAsync();

            return Ok(transacoes);
        }

        // Listagem geral só para funcionários
        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var perfil = User.FindFirst("perfil")?.Value;

            if (perfil != "funcionario")
                return Forbid();

            var transacoes = await _context.TransacoesFinanceiras.ToListAsync();
            return Ok(transacoes);
        }

        // Criação de transação só por funcionários (recargas manuais, ajustes)
        [HttpPost]
        public async Task<IActionResult> Cadastrar(TransacaoFinanceira transacao)
        {
            var perfil = User.FindFirst("perfil")?.Value;

            if (perfil != "funcionario")
                return Forbid();

            transacao.DataTransacao = DateTime.Now;

            _context.TransacoesFinanceiras.Add(transacao);

            var aluno = await _context.Alunos.FindAsync(transacao.AlunoId);

            if (aluno != null)
            {
                if (transacao.Tipo == "RECARGA")
                {
                    aluno.Saldo += transacao.Valor;
                }
                else if (transacao.Tipo == "COMPRA")
                {
                    if (aluno.Saldo < transacao.Valor)
                        return BadRequest("Saldo insuficiente.");

                    aluno.Saldo -= transacao.Valor;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(transacao);
        }
    }
}
