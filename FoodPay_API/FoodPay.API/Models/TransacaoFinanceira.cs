namespace FoodPay.API.Models
{
    public class TransacaoFinanceira
    {
        public int Id { get; set; }

        public int AlunoId { get; set; }

        public int? ResponsavelId { get; set; }

        public string Tipo { get; set; }

        public decimal Valor { get; set; }

        public string? Descricao { get; set; }

        public DateTime DataTransacao { get; set; }
    }
}