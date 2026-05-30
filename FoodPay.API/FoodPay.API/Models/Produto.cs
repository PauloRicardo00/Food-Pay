namespace FoodPay.API.Models
{
    public class Produto
    {
        public int Id { get; set; }

        public string Nome { get; set; }

        public string? Descricao { get; set; }

        public decimal Preco { get; set; }

        public string? ImagemUrl { get; set; }

        public bool Disponivel { get; set; }

        public int CategoriaId { get; set; }
    }
}