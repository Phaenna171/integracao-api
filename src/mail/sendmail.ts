const sgMail = require('@sendgrid/mail');

// Configure sua API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(formData) {
  const { to, subject, htmlContent } = formData;

  const msg = {
    to,
    from: 'seuemail@dominio.com', // Substitua pelo seu email autorizado no SendGrid
    subject,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log('Email enviado com sucesso.');
  } catch (error) {
    console.error('Erro ao enviar o email:', error.response.body.errors);
    throw new Error('Falha no envio do email.');
  }
}

module.exports = sendEmail;