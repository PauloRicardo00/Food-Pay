namespace FoodPay.API.DTOs
{
    public class AtualizarLimitesDTO
    {
        public decimal LimiteDiario { get; set; }
        public decimal LimiteSemanal { get; set; }
        public decimal LimiteMensal { get; set; }
    }
}
