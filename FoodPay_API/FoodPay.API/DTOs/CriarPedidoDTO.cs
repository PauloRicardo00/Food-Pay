namespace FoodPay.API.DTOs
{
    public class CriarPedidoDTO
    {
        public decimal ValorTotal { get; set; }

        public List<ItemPedidoDTO> Itens { get; set; } = new();
    }

    public class ItemPedidoDTO
    {
        public int ProdutoId { get; set; }

        public int Quantidade { get; set; }

        public decimal PrecoUnitario { get; set; }
    }
}