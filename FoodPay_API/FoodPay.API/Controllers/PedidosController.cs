using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using FoodPay.API.Data;
using FoodPay.API.Models;
using FoodPay.API.DTOs;
using FoodPay.API.Services;

namespace FoodPay.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PedidosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;

        public PedidosController(AppDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // Aluno vê só os próprios; responsável vê de seus dependentes; funcionário vê todos
        [HttpGet]
        public async Task<IActionResult> Listar()
        {
            var perfil = User.FindFirst("perfil")?.Value;
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;

            IQueryable<Pedido> query = _context.Pedidos.OrderByDescending(p => p.DataPedido);

            if (perfil == "aluno")
            {
                var aluno = await _context.Alunos
                    .FirstOrDefaultAsync(a => a.Email == emailUsuario);

                if (aluno == null)
                    return Unauthorized("Aluno não encontrado.");

                query = query.Where(p => p.AlunoId == aluno.Id);
            }
            else if (perfil == "responsavel")
            {
                var responsavel = await _context.Responsaveis
                    .FirstOrDefaultAsync(r => r.Email == emailUsuario);

                if (responsavel == null)
                    return Unauthorized("Responsável não encontrado.");

                var dependentesIds = await _context.ResponsavelAluno
                    .Where(ra => ra.ResponsavelId == responsavel.Id)
                    .Select(ra => ra.AlunoId)
                    .ToListAsync();

                query = query.Where(p => dependentesIds.Contains(p.AlunoId));
            }
            else if (perfil != "funcionario")
            {
                return Forbid();
            }

            var pedidos = await query
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

        // Rota dedicada para aluno ver os próprios pedidos (mantida para compatibilidade)
        [HttpGet("meus")]
        public async Task<IActionResult> MeusPedidos()
        {
            var perfil = User.FindFirst("perfil")?.Value;
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;

            if (perfil != "aluno")
                return Forbid();

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

        // Buscar pedido por ID — aluno só vê o próprio; funcionário vê qualquer um
        [HttpGet("{id}")]
        public async Task<IActionResult> BuscarPorId(int id)
        {
            var perfil = User.FindFirst("perfil")?.Value;
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;

            var pedido = await _context.Pedidos.FindAsync(id);

            if (pedido == null)
                return NotFound("Pedido não encontrado.");

            if (perfil == "aluno")
            {
                var aluno = await _context.Alunos
                    .FirstOrDefaultAsync(a => a.Email == emailUsuario);

                if (aluno == null || pedido.AlunoId != aluno.Id)
                    return Forbid();
            }
            else if (perfil == "responsavel")
            {
                var responsavel = await _context.Responsaveis
                    .FirstOrDefaultAsync(r => r.Email == emailUsuario);

                if (responsavel == null)
                    return Forbid();

                var vinculo = await _context.ResponsavelAluno
                    .AnyAsync(ra => ra.ResponsavelId == responsavel.Id && ra.AlunoId == pedido.AlunoId);

                if (!vinculo)
                    return Forbid();
            }
            else if (perfil != "funcionario")
            {
                return Forbid();
            }

            return Ok(pedido);
        }

        // Criar pedido — apenas alunos
        [HttpPost]
        public async Task<IActionResult> Cadastrar(CriarPedidoDTO pedidoDto)
        {
            var perfil = User.FindFirst("perfil")?.Value;
            var emailUsuario = User.FindFirst(ClaimTypes.Email)?.Value;

            if (perfil != "aluno")
                return Forbid();

            var aluno = await _context.Alunos
                .FirstOrDefaultAsync(a => a.Email == emailUsuario);

            if (aluno == null)
                return Unauthorized("Aluno não encontrado.");

            if (pedidoDto.Itens == null || pedidoDto.Itens.Count == 0)
                return BadRequest("O pedido precisa ter pelo menos um item.");

            var itensAgrupados = pedidoDto.Itens
                .Where(i => i.Quantidade > 0)
                .GroupBy(i => i.ProdutoId)
                .Select(g => new
                {
                    ProdutoId = g.Key,
                    Quantidade = g.Sum(i => i.Quantidade)
                })
                .ToList();

            if (itensAgrupados.Count == 0)
                return BadRequest("Informe uma quantidade válida para os itens do pedido.");

            var produtoIds = itensAgrupados.Select(i => i.ProdutoId).ToList();
            var produtos = await _context.Produtos
                .Where(p => produtoIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id);

            if (produtos.Count != produtoIds.Count)
                return NotFound("Um ou mais produtos do pedido não foram encontrados.");

            foreach (var itemDto in itensAgrupados)
            {
                var produto = produtos[itemDto.ProdutoId];

                if (!produto.Disponivel || produto.Estoque <= 0)
                    return BadRequest($"Produto indisponível: {produto.Nome}.");

                if (itemDto.Quantidade > produto.Estoque)
                    return BadRequest($"Estoque insuficiente para {produto.Nome}. Disponível: {produto.Estoque} unidade(s).");
            }

            var valorTotal = itensAgrupados.Sum(i => i.Quantidade * produtos[i.ProdutoId].Preco);

            if (aluno.Saldo < valorTotal)
                return BadRequest("Saldo insuficiente.");

            var hoje = DateTime.Today;
            var amanha = hoje.AddDays(1);
            var inicioSemana = hoje.AddDays(-(((int)hoje.DayOfWeek + 6) % 7));
            var fimSemana = inicioSemana.AddDays(7);
            var inicioMes = new DateTime(hoje.Year, hoje.Month, 1);
            var fimMes = inicioMes.AddMonths(1);

            var pedidosValidos = _context.Pedidos.Where(p =>
                p.AlunoId == aluno.Id &&
                p.Status != "Recusado" &&
                p.Status != "Cancelado");

            var totalGastoHoje = await pedidosValidos
                .Where(p => p.DataPedido >= hoje && p.DataPedido < amanha)
                .SumAsync(p => p.ValorTotal);

            if (aluno.LimiteDiario > 0 && totalGastoHoje + valorTotal > aluno.LimiteDiario)
                return BadRequest("Limite diário excedido.");

            var totalGastoSemana = await pedidosValidos
                .Where(p => p.DataPedido >= inicioSemana && p.DataPedido < fimSemana)
                .SumAsync(p => p.ValorTotal);

            if (aluno.LimiteSemanal > 0 && totalGastoSemana + valorTotal > aluno.LimiteSemanal)
                return BadRequest("Limite semanal excedido.");

            var totalGastoMes = await pedidosValidos
                .Where(p => p.DataPedido >= inicioMes && p.DataPedido < fimMes)
                .SumAsync(p => p.ValorTotal);

            if (aluno.LimiteMensal > 0 && totalGastoMes + valorTotal > aluno.LimiteMensal)
                return BadRequest("Limite mensal excedido.");

            await using var transacaoBanco = await _context.Database.BeginTransactionAsync();

            var pedido = new Pedido
            {
                AlunoId = aluno.Id,
                DataPedido = DateTime.Now,
                Status = "Pendente",
                ValorTotal = valorTotal
            };

            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();

            foreach (var itemDto in itensAgrupados)
            {
                var produto = produtos[itemDto.ProdutoId];

                var item = new ItemPedido
                {
                    PedidoId = pedido.Id,
                    ProdutoId = produto.Id,
                    Quantidade = itemDto.Quantidade,
                    PrecoUnitario = produto.Preco,
                    Subtotal = itemDto.Quantidade * produto.Preco
                };

                _context.ItensPedido.Add(item);

                produto.Estoque -= itemDto.Quantidade;
                if (produto.Estoque <= 0)
                {
                    produto.Estoque = 0;
                    produto.Disponivel = false;
                }
            }

            aluno.Saldo -= valorTotal;

            var limiteBaseAlerta = aluno.LimiteDiario > 0 ? aluno.LimiteDiario : aluno.LimiteMensal;
            var limiteMinimo = limiteBaseAlerta > 0 ? limiteBaseAlerta * 0.05m : 10m;
            var deveAlertarSaldoBaixo = aluno.Saldo < 10 || aluno.Saldo <= limiteMinimo;

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

                if (deveAlertarSaldoBaixo)
                {
                    var relacaoCompleta = await _context.ResponsavelAluno
                        .FirstOrDefaultAsync(ra =>
                            ra.ResponsavelId == relacao.ResponsavelId &&
                            ra.AlunoId == aluno.Id);

                    var podeEnviarEmail =
                        relacaoCompleta?.UltimoAlertaSaldoBaixo == null ||
                        relacaoCompleta.UltimoAlertaSaldoBaixo.Value.Date < DateTime.Today;

                    if (podeEnviarEmail)
                    {
                        var mensagemSaldoBaixo =
                            $"Atenção: o saldo do aluno {aluno.Nome} está baixo. " +
                            $"Saldo atual: R$ {aluno.Saldo:F2}. " +
                            $"Considere realizar uma recarga para evitar bloqueios de compra.";

                        _context.Notificacoes.Add(new Notificacao
                        {
                            AlunoId = null,
                            ResponsavelId = relacao.ResponsavelId,
                            Mensagem = mensagemSaldoBaixo,
                            Lida = false,
                            DataEnvio = DateTime.Now
                        });

                        var responsavel = await _context.Responsaveis
                            .FirstOrDefaultAsync(r => r.Id == relacao.ResponsavelId);

                        if (responsavel != null && !string.IsNullOrWhiteSpace(responsavel.Email))
                        {
                            await _emailService.EnviarEmailAsync(
                                responsavel.Email,
                                "Alerta de saldo baixo - Food Pay",
                                mensagemSaldoBaixo
                            );
                        }

                        relacaoCompleta!.UltimoAlertaSaldoBaixo = DateTime.Now;
                    }
                }
            }

            await _context.SaveChangesAsync();
            await transacaoBanco.CommitAsync();

            return Ok(pedido);
        }

        // Atualizar status — apenas funcionários
        [HttpPut("{id}/status")]
        public async Task<IActionResult> AtualizarStatus(int id, [FromBody] string novoStatus)
        {
            var perfil = User.FindFirst("perfil")?.Value;

            if (perfil != "funcionario")
                return Forbid();

            if (string.IsNullOrWhiteSpace(novoStatus))
                return BadRequest("Status inválido.");

            novoStatus = novoStatus.Trim();
            var statusPermitidos = new[] { "Pendente", "Em preparo", "Entregue", "Recusado" };

            if (!statusPermitidos.Contains(novoStatus))
                return BadRequest("Status inválido.");

            var pedido = await _context.Pedidos.FindAsync(id);

            if (pedido == null)
                return NotFound("Pedido não encontrado.");

            var statusAnterior = pedido.Status ?? "Pendente";
            var aluno = await _context.Alunos.FindAsync(pedido.AlunoId);

            if (aluno == null)
                return NotFound("Aluno do pedido não encontrado.");

            if (statusAnterior == "Entregue" && novoStatus != "Entregue")
                return BadRequest("Pedido entregue não pode ter o status alterado.");

            if (statusAnterior == "Recusado")
                return BadRequest("Pedido já foi recusado e estornado.");

            if (novoStatus == "Em preparo" && statusAnterior != "Pendente")
                return BadRequest("Apenas pedidos pendentes podem iniciar preparo.");

            if (novoStatus == "Entregue" && statusAnterior != "Em preparo")
                return BadRequest("Marque o pedido como Em preparo antes de entregar.");

            if (novoStatus == "Recusado" && statusAnterior != "Pendente")
                return BadRequest("Apenas pedidos pendentes podem ser recusados.");

            var mensagemAluno = $"Seu pedido #{pedido.Id} mudou para: {novoStatus}.";
            var mensagemResponsavel = $"O pedido #{pedido.Id} de {aluno.Nome} mudou para: {novoStatus}.";

            if (novoStatus == "Recusado")
            {
                var descricaoEstorno = $"Estorno do pedido #{pedido.Id}";
                var estornoJaRegistrado = await _context.TransacoesFinanceiras
                    .AnyAsync(t =>
                        t.AlunoId == pedido.AlunoId &&
                        t.Tipo == "ESTORNO" &&
                        t.Descricao == descricaoEstorno);

                if (!estornoJaRegistrado)
                {
                    aluno.Saldo += pedido.ValorTotal;

                    _context.TransacoesFinanceiras.Add(new TransacaoFinanceira
                    {
                        AlunoId = pedido.AlunoId,
                        Tipo = "ESTORNO",
                        Valor = pedido.ValorTotal,
                        Descricao = descricaoEstorno,
                        DataTransacao = DateTime.Now
                    });
                }

                var itensPedido = await _context.ItensPedido
                    .Where(i => i.PedidoId == pedido.Id)
                    .ToListAsync();

                foreach (var item in itensPedido)
                {
                    var produto = await _context.Produtos.FindAsync(item.ProdutoId);
                    if (produto == null) continue;

                    produto.Estoque += item.Quantidade;
                    if (produto.Estoque > 0)
                        produto.Disponivel = true;
                }

                mensagemAluno = $"Seu pedido #{pedido.Id} foi recusado. O valor de R$ {pedido.ValorTotal:F2} foi devolvido ao seu saldo.";
                mensagemResponsavel = $"O pedido #{pedido.Id} de {aluno.Nome} foi recusado. O valor de R$ {pedido.ValorTotal:F2} foi devolvido ao saldo do aluno.";
            }

            pedido.Status = novoStatus;

            _context.Notificacoes.Add(new Notificacao
            {
                AlunoId = pedido.AlunoId,
                ResponsavelId = null,
                Mensagem = mensagemAluno,
                Lida = false,
                DataEnvio = DateTime.Now
            });

            var responsaveis = await _context.ResponsavelAluno
                .Where(ra => ra.AlunoId == pedido.AlunoId && ra.RecebeNotificacao)
                .ToListAsync();

            foreach (var relacao in responsaveis)
            {
                _context.Notificacoes.Add(new Notificacao
                {
                    AlunoId = null,
                    ResponsavelId = relacao.ResponsavelId,
                    Mensagem = mensagemResponsavel,
                    Lida = false,
                    DataEnvio = DateTime.Now
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                pedido.Id,
                pedido.AlunoId,
                AlunoNome = aluno.Nome,
                pedido.DataPedido,
                pedido.Status,
                pedido.ValorTotal,
                AlunoSaldo = aluno.Saldo
            });
        }
    }
}
