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
    [Authorize]
    public class AlunosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AlunosController(AppDbContext context)
        {
            _context = context;
        }

        // Apenas funcionários podem listar todos os alunos
        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var perfil = User.FindFirst("perfil")?.Value;

            if (perfil != "funcionario")
                return Forbid();

            var alunos = await _context.Alunos
                .Select(a => new AlunoDTO
                {
                    Id = a.Id,
                    Nome = a.Nome,
                    Saldo = a.Saldo,
                    LimiteDiario = a.LimiteDiario,
                    LimiteSemanal = a.LimiteSemanal,
                    LimiteMensal = a.LimiteMensal,
                    Ativo = a.Ativo
                })
                .ToListAsync();

            return Ok(alunos);
        }

        [HttpGet("/api/aluno/dashboard")]
        public async Task<IActionResult> Dashboard()
        {
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;
            var perfil = User.FindFirst("perfil")?.Value;

            if (perfil != "aluno")
                return Forbid();

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
                    limiteSemanal = aluno.LimiteSemanal,
                    limiteMensal = aluno.LimiteMensal,
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

        // Aluno só acessa a si mesmo; funcionário acessa qualquer aluno
        [HttpGet("{id}")]
        public async Task<IActionResult> BuscarPorId(int id)
        {
            var perfil = User.FindFirst("perfil")?.Value;
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;

            if (perfil == "aluno")
            {
                var alunoLogado = await _context.Alunos
                    .FirstOrDefaultAsync(a => a.Email == emailUsuario);

                if (alunoLogado == null || alunoLogado.Id != id)
                    return Forbid();
            }
            else if (perfil != "funcionario")
            {
                return Forbid();
            }

            var aluno = await _context.Alunos.FindAsync(id);

            if (aluno == null)
                return NotFound("Aluno não encontrado.");

            return Ok(new AlunoDTO
            {
                Id = aluno.Id,
                Nome = aluno.Nome,
                Saldo = aluno.Saldo,
                LimiteDiario = aluno.LimiteDiario,
                LimiteSemanal = aluno.LimiteSemanal,
                LimiteMensal = aluno.LimiteMensal,
                Ativo = aluno.Ativo
            });
        }

        // Cadastro é público (registro de novo aluno)
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Cadastrar(Aluno aluno)
        {
            if (string.IsNullOrWhiteSpace(aluno.SenhaHash) || aluno.SenhaHash.Length < 6)
            {
                return BadRequest(new
                {
                    mensagem = "A senha deve possuir pelo menos 6 caracteres."
                });
            }

            aluno.Ativo = true;
            aluno.DataCriacao = DateTime.Now;
            if (aluno.LimiteSemanal <= 0) aluno.LimiteSemanal = aluno.LimiteDiario * 7;
            if (aluno.LimiteMensal <= 0) aluno.LimiteMensal = aluno.LimiteDiario * 30;
            aluno.SenhaHash = BCrypt.Net.BCrypt.HashPassword(aluno.SenhaHash);

            _context.Alunos.Add(aluno);
            await _context.SaveChangesAsync();

            return Ok(new AlunoDTO
            {
                Id = aluno.Id,
                Nome = aluno.Nome,
                Saldo = aluno.Saldo,
                LimiteDiario = aluno.LimiteDiario,
                LimiteSemanal = aluno.LimiteSemanal,
                LimiteMensal = aluno.LimiteMensal,
                Ativo = aluno.Ativo
            });
        }

        // Aluno só atualiza a si mesmo; funcionário atualiza qualquer aluno
        [HttpPut("{id}")]
        public async Task<IActionResult> Atualizar(int id, AtualizarAlunoDTO dto)
        {
            var perfil = User.FindFirst("perfil")?.Value;
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;

            if (perfil == "aluno")
            {
                var alunoLogado = await _context.Alunos
                    .FirstOrDefaultAsync(a => a.Email == emailUsuario);

                if (alunoLogado == null || alunoLogado.Id != id)
                    return Forbid();
            }
            else if (perfil != "funcionario")
            {
                return Forbid();
            }

            var aluno = await _context.Alunos.FindAsync(id);

            if (aluno == null)
                return NotFound("Aluno não encontrado.");

            aluno.Nome = dto.Nome;
            aluno.Email = dto.Email;
            aluno.Ativo = dto.Ativo;

            // Apenas funcionário pode alterar saldo e limite diretamente
            if (perfil == "funcionario")
            {
                aluno.Saldo = dto.Saldo;
                aluno.LimiteDiario = dto.LimiteDiario;
                aluno.LimiteSemanal = dto.LimiteSemanal > 0 ? dto.LimiteSemanal : dto.LimiteDiario * 7;
                aluno.LimiteMensal = dto.LimiteMensal > 0 ? dto.LimiteMensal : dto.LimiteDiario * 30;
            }

            // Senha só é alterada se fornecida, e passa pelo BCrypt
            if (!string.IsNullOrWhiteSpace(dto.NovaSenha))
            {
                if (dto.NovaSenha.Length < 6)
                    return BadRequest(new { mensagem = "A senha deve ter pelo menos 6 caracteres." });

                aluno.SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);
            }

            await _context.SaveChangesAsync();

            return Ok(new AlunoDTO
            {
                Id = aluno.Id,
                Nome = aluno.Nome,
                Saldo = aluno.Saldo,
                LimiteDiario = aluno.LimiteDiario,
                LimiteSemanal = aluno.LimiteSemanal,
                LimiteMensal = aluno.LimiteMensal,
                Ativo = aluno.Ativo
            });
        }

        // Apenas funcionários podem excluir alunos
        [HttpDelete("{id}")]
        public async Task<IActionResult> Excluir(int id)
        {
            var perfil = User.FindFirst("perfil")?.Value;

            if (perfil != "funcionario")
                return Forbid();

            var aluno = await _context.Alunos.FindAsync(id);

            if (aluno == null)
                return NotFound("Aluno não encontrado.");

            _context.Alunos.Remove(aluno);
            await _context.SaveChangesAsync();

            return Ok("Aluno excluído com sucesso.");
        }
    }
}
