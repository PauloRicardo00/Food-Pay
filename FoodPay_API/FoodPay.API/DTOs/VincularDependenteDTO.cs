namespace FoodPay.API.DTOs
{
    public class VincularDependenteDTO
    {
        public int? AlunoId { get; set; }

        public string? AlunoEmail { get; set; }

        public bool PermiteAlterarLimite { get; set; } = true;

        public bool RecebeNotificacao { get; set; } = true;
    }
}
