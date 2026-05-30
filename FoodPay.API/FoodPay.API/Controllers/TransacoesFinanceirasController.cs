using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodPay.API.Data;
using FoodPay.API.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace FoodPay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransacoesFinanceirasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransacoesFinanceirasController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet("minhas")]
        public async Task<IActionResult> MinhasTransacoes()
        {
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;

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

        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var transacoes = await _context.TransacoesFinanceiras.ToListAsync();

            return Ok(transacoes);
        }

        [HttpPost]
        public async Task<IActionResult> Cadastrar(TransacaoFinanceira transacao)
        {
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
                    {
                        return BadRequest("Saldo insuficiente.");
                    }

                    aluno.Saldo -= transacao.Valor;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(transacao);
        }
    }
}