namespace FoodPay.API.DTOs
{
    public class AlunoDTO
    {
        public int Id { get; set; }

        public string Nome { get; set; }

        public decimal Saldo { get; set; }

        public decimal LimiteDiario { get; set; }

        public decimal LimiteSemanal { get; set; }

        public decimal LimiteMensal { get; set; }

        public bool Ativo { get; set; }
    }
}
