import { prisma } from './prisma';

interface SendEmailParams {
  from: string;
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  metadata?: any;
}

export async function sendEmail(params: SendEmailParams) {
  try {
    const response = await fetch('https://api.replit.com/v1/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: params.from,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email API error: ${response.statusText}`);
    }

    const emailRecord = await prisma.emailMessage.create({
      data: {
        fromEmail: params.from,
        toEmail: params.to,
        ccEmails: params.cc || [],
        bccEmails: params.bcc || [],
        subject: params.subject,
        bodyText: params.text || null,
        bodyHtml: params.html || null,
        folder: 'sent',
        sentAt: new Date(),
        metadata: params.metadata || null,
      },
    });

    console.log(`✅ Email sent from ${params.from} to ${params.to}: ${params.subject}`);
    return { success: true, emailId: emailRecord.id };
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

export async function getEmailsByFolder(email: string, folder: string = 'sent') {
  return prisma.emailMessage.findMany({
    where: {
      OR: [
        { fromEmail: email, folder },
        { toEmail: email, folder },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

export async function getInboxEmails(email: string) {
  return prisma.emailMessage.findMany({
    where: {
      toEmail: email,
      folder: { in: ['inbox', 'received'] },
    },
    orderBy: { receivedAt: 'desc' },
    take: 100,
  });
}

export async function getSentEmails(email: string) {
  return prisma.emailMessage.findMany({
    where: {
      fromEmail: email,
      folder: 'sent',
    },
    orderBy: { sentAt: 'desc' },
    take: 100,
  });
}

export async function getTrashEmails(email: string) {
  return prisma.emailMessage.findMany({
    where: {
      OR: [
        { fromEmail: email },
        { toEmail: email },
      ],
      folder: 'trash',
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

export async function markEmailAsRead(emailId: string) {
  return prisma.emailMessage.update({
    where: { id: emailId },
    data: { read: true },
  });
}

export async function moveEmailToFolder(emailId: string, folder: string) {
  return prisma.emailMessage.update({
    where: { id: emailId },
    data: { folder },
  });
}

export async function deleteEmail(emailId: string) {
  return moveEmailToFolder(emailId, 'trash');
}

export async function sendPaymentNotificationEmail(params: {
  recipientEmail: string;
  recipientName: string;
  amount: number;
  currency: string;
  paymentDate: Date;
  description: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1FB7C4;">Pagamento Recebido - YYD</h2>
      <p>Olá ${params.recipientName},</p>
      <p>Informamos que você recebeu um pagamento:</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Valor:</strong> ${params.currency} ${params.amount.toFixed(2)}</p>
        <p><strong>Data:</strong> ${params.paymentDate.toLocaleDateString('pt-PT')}</p>
        <p><strong>Descrição:</strong> ${params.description}</p>
      </div>
      <p>O valor foi creditado em sua conta.</p>
      <p>Atenciosamente,<br>Equipe YYD</p>
    </div>
  `;

  return sendEmail({
    from: 'noreply@yyd.tours',
    to: params.recipientEmail,
    subject: `Pagamento Recebido - ${params.currency} ${params.amount.toFixed(2)}`,
    html,
    metadata: {
      type: 'payment_notification',
      amount: params.amount,
      currency: params.currency,
    },
  });
}

export async function sendTourAssignmentEmail(params: {
  guideEmail: string;
  guideName: string;
  tourTitle: string;
  tourDate: Date;
  bookingId: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1FB7C4;">Novo Tour Atribuído - YYD</h2>
      <p>Olá ${params.guideName},</p>
      <p>Você foi designado para um novo tour:</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Tour:</strong> ${params.tourTitle}</p>
        <p><strong>Data:</strong> ${params.tourDate.toLocaleDateString('pt-PT')} às ${params.tourDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
      <p><strong>⏰ Atenção:</strong> Este tour será automaticamente aprovado em 1 hora se você não responder.</p>
      <p>Por favor, acesse o backoffice para aprovar ou rejeitar este tour.</p>
      <p>Você pode rejeitar este tour até 48 horas antes da data agendada.</p>
      <p>Atenciosamente,<br>Equipe YYD</p>
    </div>
  `;

  return sendEmail({
    from: 'tours@yyd.tours',
    to: params.guideEmail,
    subject: `Novo Tour Atribuído - ${params.tourTitle}`,
    html,
    metadata: {
      type: 'tour_assignment',
      bookingId: params.bookingId,
      tourDate: params.tourDate,
    },
  });
}
