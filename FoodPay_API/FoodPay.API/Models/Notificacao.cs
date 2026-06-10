namespace FoodPay.API.Models
{
    public class Notificacao
    {
        public int Id { get; set; }

        public int? AlunoId { get; set; }

        public int? ResponsavelId { get; set; }

        public string Mensagem { get; set; }

        public bool Lida { get; set; }

        public DateTime DataEnvio { get; set; }
    }
}