using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodPay.API.Data;
using FoodPay.API.Models;
using FoodPay.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace FoodPay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PedidosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PedidosController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet("meus")]
        public async Task<IActionResult> MeusPedidos()
        {
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;

            var aluno = await _context.Alunos
                .FirstOrDefaultAsync(a => a.Email == emailUsuario);

            if (aluno == null)
                return Unauthorized("Aluno não encontrado.");

            var pedidos = await _context.Pedidos
                .Where(p => p.AlunoId == aluno.Id)
                .OrderByDescending(p => p.DataPedido)
                .Select(p => new
                {
                    p.Id,
                    p.AlunoId,
                    p.DataPedido,
                    p.Status,
                    p.ValorTotal,

                    Itens = _context.ItensPedido
                        .Where(i => i.PedidoId == p.Id)
                        .Select(i => new
                        {
                            i.Id,
                            i.ProdutoId,
                            ProdutoNome = _context.Produtos
                                .Where(prod => prod.Id == i.ProdutoId)
                                .Select(prod => prod.Nome)
                                .FirstOrDefault(),
                            i.Quantidade,
                            i.PrecoUnitario,
                            i.Subtotal
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(pedidos);
        }

        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var pedidos = await _context.Pedidos
                .OrderByDescending(p => p.DataPedido)
                .Select(p => new
                {
                    p.Id,
                    p.AlunoId,
                    AlunoNome = _context.Alunos
                        .Where(a => a.Id == p.AlunoId)
                        .Select(a => a.Nome)
                        .FirstOrDefault(),

                    p.DataPedido,
                    p.Status,
                    p.ValorTotal,

                    Itens = _context.ItensPedido
                        .Where(i => i.PedidoId == p.Id)
                        .Select(i => new
                        {
                            i.Id,
                            i.ProdutoId,
                            ProdutoNome = _context.Produtos
                                .Where(prod => prod.Id == i.ProdutoId)
                                .Select(prod => prod.Nome)
                                .FirstOrDefault(),

                            i.Quantidade,
                            i.PrecoUnitario,
                            i.Subtotal
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(pedidos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> BuscarPorId(int id)
        {
            var pedido = await _context.Pedidos.FindAsync(id);

            if (pedido == null)
                return NotFound("Pedido não encontrado.");

            return Ok(pedido);
        }

        [HttpPost]
        public async Task<IActionResult> Cadastrar(CriarPedidoDTO pedidoDto)
        {
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;

            var aluno = await _context.Alunos
                .FirstOrDefaultAsync(a => a.Email == emailUsuario);

            if (aluno == null)
                return Unauthorized("Aluno não encontrado.");

            if (pedidoDto.Itens == null || pedidoDto.Itens.Count == 0)
                return BadRequest("O pedido precisa ter pelo menos um item.");

            var valorTotal = pedidoDto.Itens.Sum(i => i.Quantidade * i.PrecoUnitario);

            if (aluno.Saldo < valorTotal)
                return BadRequest("Saldo insuficiente.");

            var totalGastoHoje = await _context.Pedidos
                .Where(p => p.AlunoId == aluno.Id && p.DataPedido.Date == DateTime.Today)
                .SumAsync(p => p.ValorTotal);

            if (totalGastoHoje + valorTotal > aluno.LimiteDiario)
                return BadRequest("Limite diário excedido.");

            var pedido = new Pedido
            {
                AlunoId = aluno.Id,
                DataPedido = DateTime.Now,
                Status = "Pendente",
                ValorTotal = valorTotal
            };

            _context.Pedidos.Add(pedido);

            await _context.SaveChangesAsync();

            foreach (var itemDto in pedidoDto.Itens)
            {
                var item = new ItemPedido
                {
                    PedidoId = pedido.Id,
                    ProdutoId = itemDto.ProdutoId,
                    Quantidade = itemDto.Quantidade,
                    PrecoUnitario = itemDto.PrecoUnitario,
                    Subtotal = itemDto.Quantidade * itemDto.PrecoUnitario
                };

                _context.ItensPedido.Add(item);
            }

            aluno.Saldo -= valorTotal;

            var transacao = new TransacaoFinanceira
            {
                AlunoId = aluno.Id,
                Tipo = "COMPRA",
                Valor = valorTotal,
                Descricao = $"Compra do pedido #{pedido.Id}",
                DataTransacao = DateTime.Now
            };

            _context.TransacoesFinanceiras.Add(transacao);

            _context.Notificacoes.Add(new Notificacao
            {
                AlunoId = aluno.Id,
                ResponsavelId = null,
                Mensagem = $"Seu pedido #{pedido.Id} foi recebido e está pendente.",
                Lida = false,
                DataEnvio = DateTime.Now
            });

            var responsaveis = await _context.ResponsavelAluno
                .Where(ra => ra.AlunoId == aluno.Id && ra.RecebeNotificacao)
                .ToListAsync();

            foreach (var relacao in responsaveis)
            {
                _context.Notificacoes.Add(new Notificacao
                {
                    AlunoId = null,
                    ResponsavelId = relacao.ResponsavelId,
                    Mensagem = $"O aluno {aluno.Nome} realizou o pedido #{pedido.Id} no valor de R$ {valorTotal:F2}.",
                    Lida = false,
                    DataEnvio = DateTime.Now
                });
            }

            await _context.SaveChangesAsync();

            return Ok(pedido);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> AtualizarStatus(int id, [FromBody] string novoStatus)
        {
            var pedido = await _context.Pedidos.FindAsync(id);

            if (pedido == null)
                return NotFound("Pedido não encontrado.");

            pedido.Status = novoStatus;

            _context.Notificacoes.Add(new Notificacao
            {
                AlunoId = pedido.AlunoId,
                ResponsavelId = null,
                Mensagem = $"Seu pedido #{pedido.Id} mudou para: {novoStatus}.",
                Lida = false,
                DataEnvio = DateTime.Now
            });

            var aluno = await _context.Alunos.FindAsync(pedido.AlunoId);

            var responsaveis = await _context.ResponsavelAluno
                .Where(ra => ra.AlunoId == pedido.AlunoId && ra.RecebeNotificacao)
                .ToListAsync();

            foreach (var relacao in responsaveis)
            {
                _context.Notificacoes.Add(new Notificacao
                {
                    AlunoId = null,
                    ResponsavelId = relacao.ResponsavelId,
                    Mensagem = $"O pedido #{pedido.Id} de {aluno?.Nome ?? "um aluno"} mudou para: {novoStatus}.",
                    Lida = false,
                    DataEnvio = DateTime.Now
                });
            }

            await _context.SaveChangesAsync();

            return Ok(pedido);
        }
    }
}