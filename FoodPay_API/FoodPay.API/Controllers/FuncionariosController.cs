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
    public class FuncionariosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FuncionariosController(AppDbContext context)
        {
            _context = context;
        }

        // Apenas funcionários podem listar todos
        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var perfil = User.FindFirst("perfil")?.Value;

            if (perfil != "funcionario")
                return Forbid();

            var funcionarios = await _context.Funcionarios
                .Select(f => new FuncionarioRespostaDTO
                {
                    Id = f.Id,
                    Nome = f.Nome,
                    Email = f.Email,
                    Cargo = f.Cargo,
                    Ativo = f.Ativo,
                    DataCriacao = f.DataCriacao
                })
                .ToListAsync();

            return Ok(funcionarios);
        }

        // Funcionário só acessa a si mesmo, ou outro funcionário pode buscar qualquer um
        [HttpGet("{id}")]
        public async Task<IActionResult> BuscarPorId(int id)
        {
            var perfil = User.FindFirst("perfil")?.Value;

            if (perfil != "funcionario")
                return Forbid();

            var funcionario = await _context.Funcionarios.FindAsync(id);

            if (funcionario == null)
                return NotFound("Funcionário não encontrado.");

            return Ok(new FuncionarioRespostaDTO
            {
                Id = funcionario.Id,
                Nome = funcionario.Nome,
                Email = funcionario.Email,
                Cargo = funcionario.Cargo,
                Ativo = funcionario.Ativo,
                DataCriacao = funcionario.DataCriacao
            });
        }

        // Cadastro de funcionário é público (registro inicial)
        [AllowAnonymous]
        [HttpPost]
        public async Task<IActionResult> Cadastrar(Funcionario funcionario)
        {
            if (string.IsNullOrWhiteSpace(funcionario.SenhaHash) || funcionario.SenhaHash.Length < 6)
            {
                return BadRequest(new
                {
                    mensagem = "A senha deve possuir pelo menos 6 caracteres."
                });
            }

            var novoFuncionario = new Funcionario
            {
                Nome = funcionario.Nome,
                Email = funcionario.Email,
                SenhaHash = BCrypt.Net.BCrypt.HashPassword(funcionario.SenhaHash),
                Cargo = string.IsNullOrWhiteSpace(funcionario.Cargo)
                    ? "Atendente"
                    : funcionario.Cargo,
                Ativo = true,
                DataCriacao = DateTime.Now
            };

            _context.Funcionarios.Add(novoFuncionario);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(BuscarPorId),
                new { id = novoFuncionario.Id },
                new FuncionarioRespostaDTO
                {
                    Id = novoFuncionario.Id,
                    Nome = novoFuncionario.Nome,
                    Email = novoFuncionario.Email,
                    Cargo = novoFuncionario.Cargo,
                    Ativo = novoFuncionario.Ativo,
                    DataCriacao = novoFuncionario.DataCriacao
                }
            );
        }

        // Funcionário só atualiza a si mesmo
        [HttpPut("{id}")]
        public async Task<IActionResult> Atualizar(int id, FuncionarioRespostaDTO dto)
        {
            var perfil = User.FindFirst("perfil")?.Value;
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;

            if (perfil != "funcionario")
                return Forbid();

            // Só pode editar o próprio perfil
            var funcionarioLogado = await _context.Funcionarios
                .FirstOrDefaultAsync(f => f.Email == emailUsuario);

            if (funcionarioLogado == null || funcionarioLogado.Id != id)
                return Forbid();

            var funcionario = await _context.Funcionarios.FindAsync(id);

            if (funcionario == null)
                return NotFound("Funcionário não encontrado.");

            funcionario.Nome = dto.Nome;
            funcionario.Email = dto.Email;
            funcionario.Ativo = dto.Ativo;

            await _context.SaveChangesAsync();

            return Ok(new FuncionarioRespostaDTO
            {
                Id = funcionario.Id,
                Nome = funcionario.Nome,
                Email = funcionario.Email,
                Cargo = funcionario.Cargo,
                Ativo = funcionario.Ativo,
                DataCriacao = funcionario.DataCriacao
            });
        }

        // Apenas o próprio funcionário pode excluir sua conta
        [HttpDelete("{id}")]
        public async Task<IActionResult> Excluir(int id)
        {
            var perfil = User.FindFirst("perfil")?.Value;
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;

            if (perfil != "funcionario")
                return Forbid();

            var funcionarioLogado = await _context.Funcionarios
                .FirstOrDefaultAsync(f => f.Email == emailUsuario);

            if (funcionarioLogado == null || funcionarioLogado.Id != id)
                return Forbid();

            var funcionario = await _context.Funcionarios.FindAsync(id);

            if (funcionario == null)
                return NotFound("Funcionário não encontrado.");

            _context.Funcionarios.Remove(funcionario);
            await _context.SaveChangesAsync();

            return Ok("Funcionário excluído com sucesso.");
        }
    }
}
