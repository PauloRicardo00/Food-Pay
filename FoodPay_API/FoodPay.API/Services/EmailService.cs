using System.Net;
using System.Net.Mail;

namespace FoodPay.API.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task EnviarCodigoResetSenha(string emailDestino, string nome, string codigo)
        {
            var host = _configuration["Smtp:Host"];
            var port = int.Parse(_configuration["Smtp:Port"]!);
            var user = _configuration["Smtp:User"];
            var pass = _configuration["Smtp:Pass"];
            var from = _configuration["Smtp:From"];

            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(user, pass),
                EnableSsl = true
            };

            var mensagem = new MailMessage
            {
                From = new MailAddress(from!, "Food Pay"),
                Subject = "Código de recuperação de senha - Food Pay",
                Body = $@"
Olá, {nome}!

Seu código de recuperação de senha é:

{codigo}

Use esse código para redefinir sua senha no Food Pay.

Se você não solicitou isso, ignore este e-mail.

Atenciosamente,
Equipe Food Pay
",
                IsBodyHtml = false
            };

            mensagem.To.Add(emailDestino);

            await client.SendMailAsync(mensagem);
        }

        public async Task EnviarEmailAsync(string emailDestino, string assunto, string mensagemTexto)
        {
            var host = _configuration["Smtp:Host"];
            var port = int.Parse(_configuration["Smtp:Port"]!);
            var user = _configuration["Smtp:User"];
            var pass = _configuration["Smtp:Pass"];
            var from = _configuration["Smtp:From"];

            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(user, pass),
                EnableSsl = true
            };

            var mensagem = new MailMessage
            {
                From = new MailAddress(from!, "Food Pay"),
                Subject = assunto,
                Body = mensagemTexto,
                IsBodyHtml = false
            };

            mensagem.To.Add(emailDestino);

            await client.SendMailAsync(mensagem);
        }
    }
}