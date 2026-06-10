namespace FoodPay.API.Models
{
    public class Pagamento
    {
        public int Id { get; set; }

        public int PedidoId { get; set; }

        public decimal Valor { get; set; }

        public string Metodo { get; set; }

        public string Status { get; set; }

        public DateTime DataPagamento { get; set; }

        public string? StripePaymentIntentId { get; set; }
    }
}