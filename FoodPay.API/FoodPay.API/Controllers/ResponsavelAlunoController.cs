using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodPay.API.Data;
using FoodPay.API.Models;

namespace FoodPay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ResponsavelAlunoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ResponsavelAlunoController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var relacoes = await _context.ResponsavelAluno
                .Select(r => new
                {
                    r.ResponsavelId,
                    r.AlunoId,
                    r.PermiteAlterarLimite,
                    r.RecebeNotificacao,

                    Aluno = _context.Alunos
                        .Where(a => a.Id == r.AlunoId)
                        .Select(a => new
                        {
                            a.Id,
                            a.Nome,
                            a.Email,
                            a.Saldo,
                            a.LimiteDiario,
                            a.Ativo
                        })
                        .FirstOrDefault(),

                    Responsavel = _context.Responsaveis
                        .Where(resp => resp.Id == r.ResponsavelId)
                        .Select(resp => new
                        {
                            resp.Id,
                            resp.Nome,
                            resp.Email,
                            resp.Telefone
                        })
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(relacoes);
        }

        [HttpPost]
        public async Task<IActionResult> Vincular(ResponsavelAluno relacao)
        {
            _context.ResponsavelAluno.Add(relacao);

            await _context.SaveChangesAsync();

            return Ok(relacao);
        }

        [HttpPut("aluno/{alunoId}/limite")]
        public async Task<IActionResult> AtualizarLimite(int alunoId, [FromBody] decimal novoLimite)
        {
            var aluno = await _context.Alunos.FindAsync(alunoId);

            if (aluno == null)
                return NotFound("Aluno não encontrado.");

            aluno.LimiteDiario = novoLimite;

            await _context.SaveChangesAsync();

            return Ok(aluno);
        }

        [HttpPut("aluno/{alunoId}/saldo")]
        public async Task<IActionResult> AtualizarSaldo(int alunoId, [FromBody] decimal novoSaldo)
        {
            var aluno = await _context.Alunos.FindAsync(alunoId);

            if (aluno == null)
                return NotFound("Aluno não encontrado.");

            aluno.Saldo = novoSaldo;

            await _context.SaveChangesAsync();

            return Ok(aluno);
        }
    }
}