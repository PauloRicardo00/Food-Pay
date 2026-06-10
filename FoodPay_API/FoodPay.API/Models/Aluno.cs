namespace FoodPay.API.Models
{
    public class Aluno
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Email { get; set; }
        public string SenhaHash { get; set; }
        public decimal Saldo { get; set; }
        public decimal LimiteDiario { get; set; }
        public decimal LimiteSemanal { get; set; }
        public decimal LimiteMensal { get; set; }
        public bool Ativo { get; set; }
        public DateTime DataCriacao { get; set; }
    }
}
