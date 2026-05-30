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
    public class NotificacoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificacoesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("minhas")]
        public async Task<IActionResult> Minhas()
        {
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;
            var perfil = User.FindFirst("perfil")?.Value;

            if (perfil == "aluno")
            {
                var aluno = await _context.Alunos
                    .FirstOrDefaultAsync(a => a.Email == emailUsuario);  

                if (aluno == null)
                    return Unauthorized("Aluno não encontrado.");

                var notificacoes = await _context.Notificacoes
                    .Where(n => n.AlunoId == aluno.Id)
                    .OrderByDescending(n => n.DataEnvio)
                    .ToListAsync();

                return Ok(notificacoes);
            }

            if (perfil == "responsavel")
            {
                var responsavel = await _context.Responsaveis
                    .FirstOrDefaultAsync(r => r.Email == emailUsuario);

                if (responsavel == null)
                    return Unauthorized("Responsável não encontrado.");

                var notificacoes = await _context.Notificacoes
                    .Where(n => n.ResponsavelId == responsavel.Id)
                    .OrderByDescending(n => n.DataEnvio)
                    .ToListAsync();

                return Ok(notificacoes);
            }

            return Forbid();
        }

        [HttpPut("{id}/ler")]
        public async Task<IActionResult> MarcarComoLida(int id)
        {
            var notificacao = await _context.Notificacoes.FindAsync(id);

            if (notificacao == null)
                return NotFound("Notificação não encontrada.");

            notificacao.Lida = true;

            await _context.SaveChangesAsync();

            return Ok(notificacao);
        }
    }
}