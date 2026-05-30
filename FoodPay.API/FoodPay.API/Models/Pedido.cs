namespace FoodPay.API.Models
{
    public class Pedido
    {
        public int Id { get; set; }

        public int AlunoId { get; set; }

        public DateTime DataPedido { get; set; }

        public string? Status { get; set; }

        public decimal ValorTotal { get; set; }
    }
}