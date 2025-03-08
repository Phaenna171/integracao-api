import { Body, Controller, Post, } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as sgMail from '@sendgrid/mail';

@ApiTags('Mail')
@Controller('mail')
export class MailController {
  constructor() { }

  @Post()
  async sendMail(@Body() mailDto: any) {
    const emailContent = `
    <h1>Ficha Técnica de Reclamação</h1>
    <p>Abaixo estão os dados do formulário preenchido:</p>
    <ul>
      ${Object.keys(mailDto)
        .map(
          (key) =>
            `<li><strong>${key}:</strong> ${mailDto[key] || 'Não informado'}</li>`
        )
        .join('')}
    </ul>
  `;

    console.log(emailContent)

    try {
      // Configuração do email
      const message = {
        to: process.env.EMAIL_TO_SEND, // Destinatário
        from: process.env.EMAIL_TO_SEND, // Remetente (configure no SendGrid)
        subject: 'Ficha Técnica de Reclamação Recebida',
        html: emailContent, // Corpo do email em HTML
      };

      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      // Envio do email
      await sgMail.send(message);
      return { message: 'Formulário enviado com sucesso!', error: false };
    } catch (error) {
      return { message: 'Erro ao enviar o formulário.', error: true};
    }
  }
}
