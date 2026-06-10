namespace FoodPay.API.DTOs
{
    public class ConfirmarResetSenhaDTO
    {
        public string Email { get; set; }
        public string Perfil { get; set; }
        public string Codigo { get; set; }
        public string NovaSenha { get; set; }
    }
}