using FoodPay.API.Data;
using FoodPay.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FoodPay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FuncionariosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FuncionariosController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var funcionarios = await _context.Funcionarios.ToListAsync();

            return Ok(funcionarios);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> BuscarPorId(int id)
        {
            var funcionario = await _context.Funcionarios.FindAsync(id);

            if (funcionario == null)
                return NotFound("Funcionário não encontrado.");

            return Ok(funcionario);
        }

        [HttpPost]
        public async Task<IActionResult> Cadastrar(Funcionario funcionario)
        {
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
                novoFuncionario
            );
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Atualizar(int id, Funcionario funcionarioAtualizado)
        {
            var funcionario = await _context.Funcionarios.FindAsync(id);

            if (funcionario == null)
                return NotFound("Funcionário não encontrado.");

            funcionario.Nome = funcionarioAtualizado.Nome;
            funcionario.Email = funcionarioAtualizado.Email;
            funcionario.Ativo = funcionarioAtualizado.Ativo;

            await _context.SaveChangesAsync();

            return Ok(funcionario);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Excluir(int id)
        {
            var funcionario = await _context.Funcionarios.FindAsync(id);

            if (funcionario == null)
                return NotFound("Funcionário não encontrado.");

            _context.Funcionarios.Remove(funcionario);
            await _context.SaveChangesAsync();

            return Ok("Funcionário excluído com sucesso.");
        }
    }
}