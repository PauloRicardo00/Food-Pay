namespace FoodPay.API.Models
{
    public class ResponsavelAluno
    {
        public int ResponsavelId { get; set; }

        public int AlunoId { get; set; }

        public bool PermiteAlterarLimite { get; set; }

        public bool RecebeNotificacao { get; set; }
        public DateTime? UltimoAlertaSaldoBaixo { get; set; }
    }
}