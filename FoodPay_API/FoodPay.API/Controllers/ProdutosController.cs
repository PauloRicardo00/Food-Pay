using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using FoodPay.API.Data;
using FoodPay.API.Models;
using FoodPay.API.DTOs;

namespace FoodPay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProdutosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ProdutosController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        // Listagem é pública (cardápio visível sem login)
        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var produtos = await _context.Produtos
                .OrderBy(p => p.Nome)
                .ToListAsync();

            return Ok(produtos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> BuscarPorId(int id)
        {
            var produto = await _context.Produtos.FindAsync(id);

            if (produto == null)
                return NotFound("Produto não encontrado.");

            return Ok(produto);
        }

        // Upload de imagem — apenas funcionários
        [Authorize]
        [HttpPost("upload-imagem")]
        public async Task<IActionResult> UploadImagem([FromForm] UploadImagemDTO dto)
        {
            var perfil = User.FindFirst("perfil")?.Value;

            if (perfil != "funcionario")
                return Forbid();

            var arquivo = dto.Arquivo;

            if (arquivo == null || arquivo.Length == 0)
                return BadRequest("Nenhuma imagem enviada.");

            var extensoesPermitidas = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extensao = Path.GetExtension(arquivo.FileName).ToLower();

            if (!extensoesPermitidas.Contains(extensao))
                return BadRequest("Formato inválido. Use JPG, PNG ou WEBP.");

            var pastaUploads = Path.Combine(
                _environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"),
                "uploads",
                "produtos"
            );

            if (!Directory.Exists(pastaUploads))
                Directory.CreateDirectory(pastaUploads);

            var nomeArquivo = $"{Guid.NewGuid()}{extensao}";
            var caminhoCompleto = Path.Combine(pastaUploads, nomeArquivo);

            using (var stream = new FileStream(caminhoCompleto, FileMode.Create))
            {
                await arquivo.CopyToAsync(stream);
            }

            var imagemUrl = $"{Request.Scheme}://{Request.Host}/uploads/produtos/{nomeArquivo}";

            return Ok(new { imagemUrl });
        }

        // Criar produto — apenas funcionários
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Cadastrar(Produto produto)
        {
            var perfil = User.FindFirst("perfil")?.Value;

            if (perfil != "funcionario")
                return Forbid();

            if (produto.Estoque < 0)
                return BadRequest("O estoque não pode ser negativo.");

            if (produto.Estoque == 0)
                produto.Disponivel = false;

            _context.Produtos.Add(produto);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(BuscarPorId), new { id = produto.Id }, produto);
        }

        // Atualizar produto — apenas funcionários
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Atualizar(int id, Produto produtoAtualizado)
        {
            var perfil = User.FindFirst("perfil")?.Value;

            if (perfil != "funcionario")
                return Forbid();

            var produto = await _context.Produtos.FindAsync(id);

            if (produto == null)
                return NotFound("Produto não encontrado.");

            if (produtoAtualizado.Estoque < 0)
                return BadRequest("O estoque não pode ser negativo.");

            produto.Nome = produtoAtualizado.Nome;
            produto.Descricao = produtoAtualizado.Descricao;
            produto.Preco = produtoAtualizado.Preco;
            produto.ImagemUrl = produtoAtualizado.ImagemUrl;
            produto.CategoriaId = produtoAtualizado.CategoriaId;
            produto.Estoque = produtoAtualizado.Estoque;
            produto.Disponivel = produtoAtualizado.Estoque > 0 && produtoAtualizado.Disponivel;

            await _context.SaveChangesAsync();

            return Ok(produto);
        }

        // Excluir produto — apenas funcionários
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Excluir(int id)
        {
            var perfil = User.FindFirst("perfil")?.Value;

            if (perfil != "funcionario")
                return Forbid();

            var produto = await _context.Produtos.FindAsync(id);

            if (produto == null)
                return NotFound("Produto não encontrado.");

            _context.Produtos.Remove(produto);
            await _context.SaveChangesAsync();

            return Ok("Produto excluído com sucesso.");
        }
    }
}
