namespace FoodPay.API.DTOs
{
    public class AtualizarAlunoDTO
    {
        public string Nome { get; set; }
        public string Email { get; set; }
        public string? NovaSenha { get; set; }
        public decimal Saldo { get; set; }
        public decimal LimiteDiario { get; set; }
        public decimal LimiteSemanal { get; set; }
        public decimal LimiteMensal { get; set; }
        public bool Ativo { get; set; }
    }
}
