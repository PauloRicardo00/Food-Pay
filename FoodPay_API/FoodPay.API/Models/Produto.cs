using System.ComponentModel.DataAnnotations;

namespace FoodPay.API.Models
{
    public class Produto
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "O nome do produto é obrigatório.")]
        public string Nome { get; set; }

        public string? Descricao { get; set; }

        [Range(0.01, 9999.99, ErrorMessage = "O preço deve estar entre R$ 0,01 e R$ 9.999,99.")]
        public decimal Preco { get; set; }

        public string? ImagemUrl { get; set; }

        public bool Disponivel { get; set; }

        [Range(0, 999999, ErrorMessage = "O estoque não pode ser negativo.")]
        public int Estoque { get; set; }

        public int CategoriaId { get; set; }
    }
}
