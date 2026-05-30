namespace FoodPay.API.Models
{
    public class Responsavel
    {
        public int Id { get; set; }

        public string Nome { get; set; }

        public string Email { get; set; }

        public string SenhaHash { get; set; }

        public string? Telefone { get; set; }

        public bool Ativo { get; set; }

        public DateTime DataCriacao { get; set; }
    }
}