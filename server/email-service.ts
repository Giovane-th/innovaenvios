import nodemailer from 'nodemailer';

// Configurar transportador de email (usando Mailtrap ou Gmail para testes)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER || 'seu-usuario',
    pass: process.env.SMTP_PASS || 'sua-senha'
  }
});

export interface EmailTemplate {
  type: 'label-created' | 'label-shipped' | 'label-delivered' | 'label-error';
  to: string;
  customerName: string;
  labelCode?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  address?: string;
  error?: string;
}

export async function sendEmail(template: EmailTemplate) {
  try {
    let subject = '';
    let htmlContent = '';

    switch (template.type) {
      case 'label-created':
        subject = '✅ Etiqueta de Envio Criada - In\'Nova Envios';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0a7ea4;">Etiqueta de Envio Criada</h2>
            <p>Olá ${template.customerName},</p>
            <p>Sua etiqueta de envio foi criada com sucesso!</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Código da Etiqueta:</strong> ${template.labelCode}</p>
              <p><strong>Endereço de Entrega:</strong></p>
              <p>${template.address}</p>
            </div>
            <p>Você pode rastrear seu envio usando o código acima.</p>
            <p>Obrigado por usar In'Nova Envios!</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Este é um email automático, não responda.</p>
          </div>
        `;
        break;

      case 'label-shipped':
        subject = '🚚 Seu Envio Foi Despachado - In\'Nova Envios';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10B981;">Envio Despachado</h2>
            <p>Olá ${template.customerName},</p>
            <p>Seu envio foi despachado com sucesso!</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Código de Rastreamento:</strong> ${template.trackingNumber}</p>
              <p><strong>Previsão de Entrega:</strong> ${template.estimatedDelivery}</p>
            </div>
            <p>Você pode acompanhar o status do seu envio em tempo real.</p>
            <p>Obrigado por usar In'Nova Envios!</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Este é um email automático, não responda.</p>
          </div>
        `;
        break;

      case 'label-delivered':
        subject = '✨ Seu Envio Foi Entregue - In\'Nova Envios';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10B981;">Envio Entregue</h2>
            <p>Olá ${template.customerName},</p>
            <p>Seu envio foi entregue com sucesso!</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Código de Rastreamento:</strong> ${template.trackingNumber}</p>
              <p>Obrigado por sua compra!</p>
            </div>
            <p>Obrigado por usar In'Nova Envios!</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Este é um email automático, não responda.</p>
          </div>
        `;
        break;

      case 'label-error':
        subject = '⚠️ Problema no Envio - In\'Nova Envios';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #EF4444;">Problema no Envio</h2>
            <p>Olá ${template.customerName},</p>
            <p>Ocorreu um problema com seu envio:</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Erro:</strong> ${template.error}</p>
              <p><strong>Código de Rastreamento:</strong> ${template.trackingNumber}</p>
            </div>
            <p>Estamos trabalhando para resolver este problema. Você será notificado em breve.</p>
            <p>Obrigado por usar In'Nova Envios!</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Este é um email automático, não responda.</p>
          </div>
        `;
        break;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@innovaenvios.app',
      to: template.to,
      subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function sendLabelCreatedEmail(
  customerEmail: string,
  customerName: string,
  labelCode: string,
  address: string
) {
  return sendEmail({
    type: 'label-created',
    to: customerEmail,
    customerName,
    labelCode,
    address
  });
}

export async function sendLabelShippedEmail(
  customerEmail: string,
  customerName: string,
  trackingNumber: string,
  estimatedDelivery: string
) {
  return sendEmail({
    type: 'label-shipped',
    to: customerEmail,
    customerName,
    trackingNumber,
    estimatedDelivery
  });
}

export async function sendLabelDeliveredEmail(
  customerEmail: string,
  customerName: string,
  trackingNumber: string
) {
  return sendEmail({
    type: 'label-delivered',
    to: customerEmail,
    customerName,
    trackingNumber
  });
}

export async function sendLabelErrorEmail(
  customerEmail: string,
  customerName: string,
  trackingNumber: string,
  error: string
) {
  return sendEmail({
    type: 'label-error',
    to: customerEmail,
    customerName,
    trackingNumber,
    error
  });
}
