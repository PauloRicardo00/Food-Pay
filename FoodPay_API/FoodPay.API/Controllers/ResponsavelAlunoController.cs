using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using FoodPay.API.Data;
using FoodPay.API.Models;
using FoodPay.API.DTOs;

namespace FoodPay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ResponsavelAlunoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ResponsavelAlunoController(AppDbContext context)
        {
            _context = context;
        }

        // Responsável só vê seus próprios dependentes; funcionário vê todos
        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var perfil = User.FindFirst("perfil")?.Value;
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;

            IQueryable<ResponsavelAluno> query = _context.ResponsavelAluno;

            if (perfil == "responsavel")
            {
                var responsavel = await _context.Responsaveis
                    .FirstOrDefaultAsync(r => r.Email == emailUsuario);

                if (responsavel == null)
                    return Unauthorized("Responsável não encontrado.");

                query = query.Where(r => r.ResponsavelId == responsavel.Id);
            }
            else if (perfil != "funcionario")
            {
                return Forbid();
            }

            var relacoes = await query
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
                            a.LimiteSemanal,
                            a.LimiteMensal,
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

        // Responsável adiciona um aluno existente como dependente do próprio usuário logado
        [HttpPost("meus-dependentes")]
        public async Task<IActionResult> AdicionarMeuDependente(VincularDependenteDTO dto)
        {
            var perfil = User.FindFirst("perfil")?.Value;
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;

            if (perfil != "responsavel")
                return Forbid();

            var responsavel = await _context.Responsaveis
                .FirstOrDefaultAsync(r => r.Email == emailUsuario);

            if (responsavel == null)
                return Unauthorized("Responsável não encontrado.");

            Aluno? aluno = null;

            if (dto.AlunoId.HasValue && dto.AlunoId.Value > 0)
            {
                aluno = await _context.Alunos.FindAsync(dto.AlunoId.Value);
            }
            else if (!string.IsNullOrWhiteSpace(dto.AlunoEmail))
            {
                var emailAluno = dto.AlunoEmail.Trim().ToLower();

                aluno = await _context.Alunos
                    .FirstOrDefaultAsync(a => a.Email.ToLower() == emailAluno);
            }

            if (aluno == null)
                return NotFound("Aluno não encontrado. Verifique o e-mail informado.");

            if (!aluno.Ativo)
                return BadRequest("Não é possível vincular um aluno inativo.");

            var jaExiste = await _context.ResponsavelAluno.AnyAsync(ra =>
                ra.ResponsavelId == responsavel.Id &&
                ra.AlunoId == aluno.Id);

            if (jaExiste)
                return BadRequest("Este aluno já está vinculado aos seus dependentes.");

            var relacao = new ResponsavelAluno
            {
                ResponsavelId = responsavel.Id,
                AlunoId = aluno.Id,
                PermiteAlterarLimite = dto.PermiteAlterarLimite,
                RecebeNotificacao = dto.RecebeNotificacao
            };

            _context.ResponsavelAluno.Add(relacao);

            _context.Notificacoes.Add(new Notificacao
            {
                ResponsavelId = responsavel.Id,
                Mensagem = $"Dependente {aluno.Nome} vinculado com sucesso.",
                Lida = false,
                DataEnvio = DateTime.Now
            });

            await _context.SaveChangesAsync();

            return Ok(new
            {
                relacao.ResponsavelId,
                relacao.AlunoId,
                relacao.PermiteAlterarLimite,
                relacao.RecebeNotificacao,
                Aluno = new
                {
                    aluno.Id,
                    aluno.Nome,
                    aluno.Email,
                    aluno.Saldo,
                    aluno.LimiteDiario,
                    aluno.LimiteSemanal,
                    aluno.LimiteMensal,
                    aluno.Ativo
                },
                Responsavel = new
                {
                    responsavel.Id,
                    responsavel.Nome,
                    responsavel.Email,
                    responsavel.Telefone
                }
            });
        }

        // Responsável remove apenas o vínculo com o próprio dependente. O aluno não é excluído do sistema.
        [HttpDelete("aluno/{alunoId}")]
        public async Task<IActionResult> RemoverMeuDependente(int alunoId)
        {
            var perfil = User.FindFirst("perfil")?.Value;
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;

            if (perfil != "responsavel")
                return Forbid();

            var responsavel = await _context.Responsaveis
                .FirstOrDefaultAsync(r => r.Email == emailUsuario);

            if (responsavel == null)
                return Unauthorized("Responsável não encontrado.");

            var relacao = await _context.ResponsavelAluno
                .FirstOrDefaultAsync(ra =>
                    ra.ResponsavelId == responsavel.Id &&
                    ra.AlunoId == alunoId);

            if (relacao == null)
                return NotFound("Dependente não encontrado para este responsável.");

            var aluno = await _context.Alunos.FindAsync(alunoId);

            _context.ResponsavelAluno.Remove(relacao);

            _context.Notificacoes.Add(new Notificacao
            {
                ResponsavelId = responsavel.Id,
                Mensagem = aluno == null
                    ? "Dependente removido com sucesso."
                    : $"Dependente {aluno.Nome} removido com sucesso.",
                Lida = false,
                DataEnvio = DateTime.Now
            });

            await _context.SaveChangesAsync();

            return Ok("Dependente removido com sucesso.");
        }

        // Apenas funcionários podem criar vínculos administrativos
        [HttpPost]
        public async Task<IActionResult> Vincular(ResponsavelAluno relacao)
        {
            var perfil = User.FindFirst("perfil")?.Value;

            if (perfil != "funcionario")
                return Forbid();

            var alunoExiste = await _context.Alunos.AnyAsync(a => a.Id == relacao.AlunoId);
            var responsavelExiste = await _context.Responsaveis.AnyAsync(r => r.Id == relacao.ResponsavelId);

            if (!alunoExiste)
                return NotFound("Aluno não encontrado.");

            if (!responsavelExiste)
                return NotFound("Responsável não encontrado.");

            var jaExiste = await _context.ResponsavelAluno.AnyAsync(ra =>
                ra.ResponsavelId == relacao.ResponsavelId &&
                ra.AlunoId == relacao.AlunoId);

            if (jaExiste)
                return BadRequest("Este vínculo já existe.");

            _context.ResponsavelAluno.Add(relacao);
            await _context.SaveChangesAsync();

            return Ok(relacao);
        }

        // Responsável só altera limite do próprio dependente
        [HttpPut("aluno/{alunoId}/limite")]
        public async Task<IActionResult> AtualizarLimite(int alunoId, [FromBody] decimal novoLimite)
        {
            return await AtualizarLimites(alunoId, new AtualizarLimitesDTO
            {
                LimiteDiario = novoLimite,
                LimiteSemanal = novoLimite * 7,
                LimiteMensal = novoLimite * 30
            });
        }

        // Atualiza limite diário, semanal e mensal do dependente
        [HttpPut("aluno/{alunoId}/limites")]
        public async Task<IActionResult> AtualizarLimites(int alunoId, [FromBody] AtualizarLimitesDTO dto)
        {
            var perfil = User.FindFirst("perfil")?.Value;
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;

            if (perfil == "responsavel")
            {
                var responsavel = await _context.Responsaveis
                    .FirstOrDefaultAsync(r => r.Email == emailUsuario);

                if (responsavel == null)
                    return Unauthorized("Responsável não encontrado.");

                var vinculo = await _context.ResponsavelAluno
                    .FirstOrDefaultAsync(ra =>
                        ra.ResponsavelId == responsavel.Id &&
                        ra.AlunoId == alunoId &&
                        ra.PermiteAlterarLimite);

                if (vinculo == null)
                    return Forbid();
            }
            else if (perfil != "funcionario")
            {
                return Forbid();
            }

            if (dto.LimiteDiario <= 0 || dto.LimiteSemanal <= 0 || dto.LimiteMensal <= 0)
                return BadRequest("Os limites diário, semanal e mensal devem ser valores positivos.");

            if (dto.LimiteDiario > 99999.99m || dto.LimiteSemanal > 99999.99m || dto.LimiteMensal > 99999.99m)
                return BadRequest("O limite máximo permitido é R$ 99.999,99.");

            if (dto.LimiteSemanal < dto.LimiteDiario)
                return BadRequest("O limite semanal não pode ser menor que o limite diário.");

            if (dto.LimiteMensal < dto.LimiteSemanal)
                return BadRequest("O limite mensal não pode ser menor que o limite semanal.");

            var aluno = await _context.Alunos.FindAsync(alunoId);

            if (aluno == null)
                return NotFound("Aluno não encontrado.");

            aluno.LimiteDiario = dto.LimiteDiario;
            aluno.LimiteSemanal = dto.LimiteSemanal;
            aluno.LimiteMensal = dto.LimiteMensal;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                aluno.Id,
                aluno.Nome,
                aluno.LimiteDiario,
                aluno.LimiteSemanal,
                aluno.LimiteMensal
            });
        }

        // Apenas funcionários podem alterar saldo diretamente
        [HttpPut("aluno/{alunoId}/saldo")]
        public async Task<IActionResult> AtualizarSaldo(int alunoId, [FromBody] decimal novoSaldo)
        {
            var perfil = User.FindFirst("perfil")?.Value;

            if (perfil != "funcionario")
                return Forbid();

            var aluno = await _context.Alunos.FindAsync(alunoId);

            if (aluno == null)
                return NotFound("Aluno não encontrado.");

            aluno.Saldo = novoSaldo;
            await _context.SaveChangesAsync();

            return Ok(new { aluno.Id, aluno.Nome, aluno.Saldo });
        }
    }
}
