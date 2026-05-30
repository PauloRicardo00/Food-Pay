using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FoodPay.API.Data;
using FoodPay.API.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace FoodPay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO login)
        {
            if (login.Perfil == "funcionario")
            {
                var funcionario = await _context.Funcionarios
                    .FirstOrDefaultAsync(f => f.Email == login.Email);

                if (funcionario == null)
                    return Unauthorized("Email ou senha inválidos.");

                bool senhaValida = BCrypt.Net.BCrypt.Verify(
                    login.Senha,
                    funcionario.SenhaHash
                );

                if (!senhaValida)
                    return Unauthorized("Email ou senha inválidos.");

                return Ok(GerarToken(
                    funcionario.Id,
                    funcionario.Nome,
                    funcionario.Email,
                    "funcionario"
                ));
            }

            if (login.Perfil == "responsavel")
            {
                var responsavel = await _context.Responsaveis
                    .FirstOrDefaultAsync(r => r.Email == login.Email);

                if (responsavel == null)
                    return Unauthorized("Email ou senha inválidos.");

                bool senhaValida = BCrypt.Net.BCrypt.Verify(
                    login.Senha,
                    responsavel.SenhaHash
                );

                if (!senhaValida)
                    return Unauthorized("Email ou senha inválidos.");

                return Ok(GerarToken(
                    responsavel.Id,
                    responsavel.Nome,
                    responsavel.Email,
                    "responsavel"
                ));
            }

            var aluno = await _context.Alunos
                .FirstOrDefaultAsync(a => a.Email == login.Email);

            if (aluno == null)
                return Unauthorized("Email ou senha inválidos.");

            bool senhaAluno = BCrypt.Net.BCrypt.Verify(
                login.Senha,
                aluno.SenhaHash
            );

            if (!senhaAluno)
                return Unauthorized("Email ou senha inválidos.");

            return Ok(GerarToken(
                aluno.Id,
                aluno.Nome,
                aluno.Email,
                "aluno"
            ));
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
                var aluno = await _context.Alunos
                    .FirstOrDefaultAsync(a => a.Email == emailUsuario);

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
                    ativo = aluno.Ativo
                });
            }

            if (perfil == "funcionario")
            {
                var funcionario = await _context.Funcionarios
                    .FirstOrDefaultAsync(f => f.Email == emailUsuario);

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
                var responsavel = await _context.Responsaveis
                    .FirstOrDefaultAsync(r => r.Email == emailUsuario);

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

            var tokenString = new JwtSecurityTokenHandler()
                .WriteToken(token);

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