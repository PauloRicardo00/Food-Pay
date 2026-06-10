using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FoodPay.API.Data;
using FoodPay.API.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using FoodPay.API.Services;

namespace FoodPay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly EmailService _emailService;

        private static readonly Dictionary<string, ResetSenhaInfo> CodigosResetSenha = new();

        private class ResetSenhaInfo
        {
            public string Codigo { get; set; } = string.Empty;
            public DateTime ExpiraEm { get; set; }
        }

        public AuthController(AppDbContext context, IConfiguration configuration, EmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO login)
        {
            var perfil = login.Perfil?.ToLower();
            var email = login.Email?.ToLower();

            if (perfil == "funcionario")
            {
                var funcionario = await _context.Funcionarios
                    .FirstOrDefaultAsync(f => f.Email.ToLower() == email);

                if (funcionario == null || !BCrypt.Net.BCrypt.Verify(login.Senha, funcionario.SenhaHash))
                    return Unauthorized("Email ou senha inválidos.");

                return Ok(GerarToken(funcionario.Id, funcionario.Nome, funcionario.Email, "funcionario"));
            }

            if (perfil == "responsavel")
            {
                var responsavel = await _context.Responsaveis
                    .FirstOrDefaultAsync(r => r.Email.ToLower() == email);

                if (responsavel == null || !BCrypt.Net.BCrypt.Verify(login.Senha, responsavel.SenhaHash))
                    return Unauthorized("Email ou senha inválidos.");

                return Ok(GerarToken(responsavel.Id, responsavel.Nome, responsavel.Email, "responsavel"));
            }

            if (perfil == "aluno")
            {
                var aluno = await _context.Alunos
                    .FirstOrDefaultAsync(a => a.Email.ToLower() == email);

                if (aluno == null || !BCrypt.Net.BCrypt.Verify(login.Senha, aluno.SenhaHash))
                    return Unauthorized("Email ou senha inválidos.");

                return Ok(GerarToken(aluno.Id, aluno.Nome, aluno.Email, "aluno"));
            }

            return BadRequest("Perfil inválido.");
        }

        [HttpPost("solicitar-reset-senha")]
        public async Task<IActionResult> SolicitarResetSenha([FromBody] SolicitarResetSenhaDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Perfil))
                return BadRequest(new { mensagem = "Email e perfil são obrigatórios." });

            var perfil = dto.Perfil.ToLower();
            var email = dto.Email.ToLower();

            string? nome = null;

            if (perfil == "aluno")
            {
                var aluno = await _context.Alunos.FirstOrDefaultAsync(a => a.Email.ToLower() == email);
                if (aluno == null) return NotFound(new { mensagem = "Usuário não encontrado para este perfil." });
                nome = aluno.Nome;
            }
            else if (perfil == "responsavel")
            {
                var responsavel = await _context.Responsaveis.FirstOrDefaultAsync(r => r.Email.ToLower() == email);
                if (responsavel == null) return NotFound(new { mensagem = "Usuário não encontrado para este perfil." });
                nome = responsavel.Nome;
            }
            else if (perfil == "funcionario")
            {
                var funcionario = await _context.Funcionarios.FirstOrDefaultAsync(f => f.Email.ToLower() == email);
                if (funcionario == null) return NotFound(new { mensagem = "Usuário não encontrado para este perfil." });
                nome = funcionario.Nome;
            }
            else
            {
                return BadRequest(new { mensagem = "Perfil inválido." });
            }

            var codigo = new Random().Next(100000, 999999).ToString();
            var chave = $"{perfil}:{email}";

            CodigosResetSenha[chave] = new ResetSenhaInfo
            {
                Codigo = codigo,
                ExpiraEm = DateTime.Now.AddMinutes(15)
            };

            await _emailService.EnviarCodigoResetSenha(email, nome, codigo);

            return Ok(new
            {
                mensagem = "Código de recuperação enviado para o e-mail informado."
            });
        }

        [HttpPost("confirmar-reset-senha")]
        public async Task<IActionResult> ConfirmarResetSenha([FromBody] ConfirmarResetSenhaDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) ||
                string.IsNullOrWhiteSpace(dto.Perfil) ||
                string.IsNullOrWhiteSpace(dto.Codigo) ||
                string.IsNullOrWhiteSpace(dto.NovaSenha))
            {
                return BadRequest(new { mensagem = "Todos os campos são obrigatórios." });
            }

            if (dto.NovaSenha.Length < 6)
            {
                return BadRequest(new
                {
                    mensagem = "A senha deve possuir pelo menos 6 caracteres."
                });
            }

            var perfil = dto.Perfil.ToLower();
            var email = dto.Email.ToLower();
            var chave = $"{perfil}:{email}";

            if (!CodigosResetSenha.ContainsKey(chave))
                return BadRequest(new { mensagem = "Código inválido ou expirado." });

            var resetInfo = CodigosResetSenha[chave];

            if (resetInfo.Codigo != dto.Codigo)
                return BadRequest(new { mensagem = "Código inválido ou expirado." });

            if (DateTime.Now > resetInfo.ExpiraEm)
            {
                CodigosResetSenha.Remove(chave);
                return BadRequest(new { mensagem = "Código expirado. Solicite um novo código." });
            }

            var novaSenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.NovaSenha);

            if (perfil == "aluno")
            {
                var aluno = await _context.Alunos.FirstOrDefaultAsync(a => a.Email.ToLower() == email);

                if (aluno == null)
                    return NotFound(new { mensagem = "Aluno não encontrado." });

                aluno.SenhaHash = novaSenhaHash;
            }
            else if (perfil == "responsavel")
            {
                var responsavel = await _context.Responsaveis.FirstOrDefaultAsync(r => r.Email.ToLower() == email);

                if (responsavel == null)
                    return NotFound(new { mensagem = "Responsável não encontrado." });

                responsavel.SenhaHash = novaSenhaHash;
            }
            else if (perfil == "funcionario")
            {
                var funcionario = await _context.Funcionarios.FirstOrDefaultAsync(f => f.Email.ToLower() == email);

                if (funcionario == null)
                    return NotFound(new { mensagem = "Funcionário não encontrado." });

                funcionario.SenhaHash = novaSenhaHash;
            }
            else
            {
                return BadRequest(new { mensagem = "Perfil inválido." });
            }

            CodigosResetSenha.Remove(chave);
            await _context.SaveChangesAsync();

            return Ok(new { mensagem = "Senha alterada com sucesso." });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;
            var perfil = User.FindFirst("perfil")?.Value;

            if (string.IsNullOrEmpty(emailUsuario) || string.IsNullOrEmpty(perfil))
                return Unauthorized("Token inválido.");

            if (perfil == "aluno")
            {
                var aluno = await _context.Alunos.FirstOrDefaultAsync(a => a.Email == emailUsuario);

                if (aluno == null)
                    return NotFound("Usuário não encontrado.");

                return Ok(new
                {
                    id = aluno.Id,
                    nome = aluno.Nome,
                    email = aluno.Email,
                    perfil = "aluno",
                    saldo = aluno.Saldo,
                    limiteDiario = aluno.LimiteDiario,
                    limiteSemanal = aluno.LimiteSemanal,
                    limiteMensal = aluno.LimiteMensal,
                    ativo = aluno.Ativo
                });
            }

            if (perfil == "funcionario")
            {
                var funcionario = await _context.Funcionarios.FirstOrDefaultAsync(f => f.Email == emailUsuario);

                if (funcionario == null)
                    return NotFound("Usuário não encontrado.");

                return Ok(new
                {
                    id = funcionario.Id,
                    nome = funcionario.Nome,
                    email = funcionario.Email,
                    perfil = "funcionario"
                });
            }

            if (perfil == "responsavel")
            {
                var responsavel = await _context.Responsaveis.FirstOrDefaultAsync(r => r.Email == emailUsuario);

                if (responsavel == null)
                    return NotFound("Usuário não encontrado.");

                return Ok(new
                {
                    id = responsavel.Id,
                    nome = responsavel.Nome,
                    email = responsavel.Email,
                    perfil = "responsavel"
                });
            }

            return Unauthorized("Perfil inválido.");
        }

        private object GerarToken(int id, string nome, string email, string perfil)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, id.ToString()),
                new Claim(ClaimTypes.Name, nome),
                new Claim(ClaimTypes.Email, email),
                new Claim("perfil", perfil)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));

            var creds = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds);

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return new
            {
                token = tokenString,
                user = new
                {
                    id,
                    nome,
                    email,
                    perfil
                }
            };
        }
    }
}