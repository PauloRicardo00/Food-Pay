using Microsoft.EntityFrameworkCore;
using FoodPay.API.Models;

namespace FoodPay.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Produto> Produtos { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Aluno> Alunos { get; set; }
        public DbSet<Funcionario> Funcionarios { get; set; }
        public DbSet<Responsavel> Responsaveis { get; set; }
        public DbSet<ResponsavelAluno> ResponsavelAluno { get; set; }
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<ItemPedido> ItensPedido { get; set; }
        public DbSet<Pagamento> Pagamentos { get; set; }
        public DbSet<TransacaoFinanceira> TransacoesFinanceiras { get; set; }
        public DbSet<Notificacao> Notificacoes { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ResponsavelAluno>()
                .HasKey(ra => new { ra.ResponsavelId, ra.AlunoId });

            base.OnModelCreating(modelBuilder);
        }
    }
}