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

    try {
      // Configuração do email
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const arr = process.env.EMAILS_TO_SEND.split(',')
      console.log('arr:', arr)
      await Promise.all(arr.map(async (email) => {
        const message = {
          to: email, // Destinatário
          from: process.env.EMAIL_FROM, // Remetente (configure no SendGrid)
          subject: 'Ficha Técnica de Reclamação Recebida',
          html: emailContent, // Corpo do email em HTML
        };

        // Envio do email
        await sgMail.send(message)
          .catch(e => console.error('e 41:', e));
      }))

      return { message: 'Formulário enviado com sucesso!', error: false };
    } catch (error) {
      return { message: 'Erro ao enviar o formulário.', error: true };
    }
  }
}
