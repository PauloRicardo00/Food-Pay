using FoodPay.API.Data;
using FoodPay.API.DTOs;
using FoodPay.API.Models;
using Microsoft.EntityFrameworkCore;
using Stripe.Checkout;
using System.Globalization;
using System.Security.Claims;
using System.Data;

namespace FoodPay.API.Services
{
    public class StripeRecargaService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public StripeRecargaService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<Session> CriarCheckoutAsync(ClaimsPrincipal usuarioLogado, CriarCheckoutDTO dto)
        {
            if (dto.Valor <= 0)
                throw new ArgumentException("Valor inválido.");

            var aluno = await ObterAlunoAutorizadoAsync(usuarioLogado, dto.AlunoId);

            var valorEmCentavos = (long)Math.Round(dto.Valor * 100, MidpointRounding.AwayFromZero);

            var successUrl = MontarSuccessUrlComSessionId(_configuration["Stripe:SuccessUrl"]);

            var options = new SessionCreateOptions
            {
                Mode = "payment",
                SuccessUrl = successUrl,
                CancelUrl = _configuration["Stripe:CancelUrl"],
                PaymentMethodTypes = new List<string> { "card" },

                Metadata = new Dictionary<string, string>
                {
                    { "alunoId", aluno.Id.ToString() },
                    { "valor", dto.Valor.ToString(CultureInfo.InvariantCulture) }
                },

                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        Quantity = 1,
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "brl",
                            UnitAmount = valorEmCentavos,
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = $"Recarga Food Pay - {aluno.Nome}"
                            }
                        }
                    }
                }
            };

            var service = new SessionService();
            return await service.CreateAsync(options);
        }

        public async Task<ResultadoWebhookStripe> ConfirmarCheckoutAsync(ClaimsPrincipal usuarioLogado, string sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
                return ResultadoWebhookStripe.Ignorado("SessionId da Stripe não informado.");

            var service = new SessionService();
            var session = await service.GetAsync(sessionId);

            if (session?.Metadata == null ||
                !session.Metadata.TryGetValue("alunoId", out var alunoIdTexto) ||
                !int.TryParse(alunoIdTexto, out var alunoId))
            {
                return ResultadoWebhookStripe.Ignorado("Metadata da sessão inválida.");
            }

            // Confirma que o usuário logado tem permissão para confirmar essa recarga.
            // Isso evita que um usuário autenticado tente confirmar uma sessão de outro aluno.
            await ObterAlunoAutorizadoAsync(usuarioLogado, alunoId);

            return await ProcessarCheckoutConcluidoAsync(session);
        }

        public async Task<ResultadoWebhookStripe> ProcessarCheckoutConcluidoAsync(Session session)
        {
            if (session.Metadata == null ||
                !session.Metadata.TryGetValue("alunoId", out var alunoIdTexto) ||
                !session.Metadata.TryGetValue("valor", out var valorTexto))
            {
                return ResultadoWebhookStripe.Ignorado("Metadata não encontrada.");
            }

            if (!int.TryParse(alunoIdTexto, out var alunoId))
                return ResultadoWebhookStripe.Ignorado("AlunoId inválido na metadata.");

            if (!decimal.TryParse(valorTexto, NumberStyles.Number, CultureInfo.InvariantCulture, out var valor))
                return ResultadoWebhookStripe.Ignorado("Valor inválido na metadata.");

            if (!string.IsNullOrWhiteSpace(session.PaymentStatus) &&
                !session.PaymentStatus.Equals("paid", StringComparison.OrdinalIgnoreCase))
            {
                return ResultadoWebhookStripe.Ignorado($"Pagamento ainda não confirmado. Status: {session.PaymentStatus}.");
            }

            if (string.IsNullOrWhiteSpace(session.Id))
                return ResultadoWebhookStripe.Ignorado("SessionId da Stripe não informado.");

            var descricaoUnica = $"Recarga Stripe Session {session.Id}";
            var paymentIntentId = session.PaymentIntentId;

            await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);

            var jaProcessado = await _context.TransacoesFinanceiras.AnyAsync(t =>
                t.Descricao == descricaoUnica ||
                (!string.IsNullOrWhiteSpace(paymentIntentId) && t.Descricao == $"Recarga Stripe PaymentIntent {paymentIntentId}"));

            if (jaProcessado)
            {
                await transaction.CommitAsync();
                return ResultadoWebhookStripe.Ignorado("Pagamento já processado anteriormente.");
            }

            var aluno = await _context.Alunos.FindAsync(alunoId);

            if (aluno == null)
            {
                await transaction.RollbackAsync();
                return ResultadoWebhookStripe.Ignorado("Aluno não encontrado.");
            }

            aluno.Saldo += valor;

            _context.TransacoesFinanceiras.Add(new TransacaoFinanceira
            {
                AlunoId = aluno.Id,
                Tipo = "RECARGA",
                Valor = valor,
                Descricao = descricaoUnica,
                DataTransacao = DateTime.Now
            });

            _context.Notificacoes.Add(new Notificacao
            {
                AlunoId = aluno.Id,
                Mensagem = $"Saldo atualizado com sucesso. Valor recarregado: R$ {valor:F2}.",
                Lida = false,
                DataEnvio = DateTime.Now
            });

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return ResultadoWebhookStripe.Processado($"Saldo atualizado para o aluno {aluno.Id}. Valor: {valor:F2}.");
        }

        private static string MontarSuccessUrlComSessionId(string? successUrl)
        {
            var urlBase = string.IsNullOrWhiteSpace(successUrl)
                ? "http://localhost:5173/responsavel/limite?pagamento=sucesso"
                : successUrl;

            if (urlBase.Contains("{CHECKOUT_SESSION_ID}"))
                return urlBase;

            var separador = urlBase.Contains('?') ? "&" : "?";
            return $"{urlBase}{separador}session_id={{CHECKOUT_SESSION_ID}}";
        }

        private async Task<Aluno> ObterAlunoAutorizadoAsync(ClaimsPrincipal usuarioLogado, int? alunoIdSolicitado)
        {
            var perfil = usuarioLogado.FindFirst("perfil")?.Value;
            var emailUsuario = usuarioLogado.FindFirst(ClaimTypes.Email)?.Value;

            if (string.IsNullOrWhiteSpace(perfil) || string.IsNullOrWhiteSpace(emailUsuario))
                throw new UnauthorizedAccessException("Usuário não identificado.");

            if (perfil == "aluno")
            {
                var aluno = await _context.Alunos.FirstOrDefaultAsync(a => a.Email == emailUsuario);

                if (aluno == null)
                    throw new UnauthorizedAccessException("Aluno não encontrado.");

                if (alunoIdSolicitado.HasValue && alunoIdSolicitado.Value != aluno.Id)
                    throw new UnauthorizedAccessException("Aluno não autorizado para esta recarga.");

                return aluno;
            }

            if (perfil == "responsavel")
            {
                if (!alunoIdSolicitado.HasValue || alunoIdSolicitado.Value <= 0)
                    throw new ArgumentException("Aluno inválido.");

                var responsavel = await _context.Responsaveis.FirstOrDefaultAsync(r => r.Email == emailUsuario);

                if (responsavel == null)
                    throw new UnauthorizedAccessException("Responsável não encontrado.");

                var possuiVinculo = await _context.ResponsavelAluno.AnyAsync(ra =>
                    ra.ResponsavelId == responsavel.Id && ra.AlunoId == alunoIdSolicitado.Value);

                if (!possuiVinculo)
                    throw new UnauthorizedAccessException("Responsável não autorizado para recarregar este aluno.");

                var aluno = await _context.Alunos.FindAsync(alunoIdSolicitado.Value);

                if (aluno == null)
                    throw new ArgumentException("Aluno não encontrado.");

                return aluno;
            }

            if (perfil == "funcionario")
            {
                if (!alunoIdSolicitado.HasValue || alunoIdSolicitado.Value <= 0)
                    throw new ArgumentException("Aluno inválido.");

                var aluno = await _context.Alunos.FindAsync(alunoIdSolicitado.Value);

                if (aluno == null)
                    throw new ArgumentException("Aluno não encontrado.");

                return aluno;
            }

            throw new UnauthorizedAccessException("Perfil não autorizado para criar checkout.");
        }
    }

    public class ResultadoWebhookStripe
    {
        public bool FoiProcessado { get; private set; }
        public string Mensagem { get; private set; } = string.Empty;

        public static ResultadoWebhookStripe Processado(string mensagem)
        {
            return new ResultadoWebhookStripe
            {
                FoiProcessado = true,
                Mensagem = mensagem
            };
        }

        public static ResultadoWebhookStripe Ignorado(string mensagem)
        {
            return new ResultadoWebhookStripe
            {
                FoiProcessado = false,
                Mensagem = mensagem
            };
        }
    }
}
