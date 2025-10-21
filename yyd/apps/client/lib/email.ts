import { sendEmail as replitSendEmail } from './replitmail';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}

export class EmailService {
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const result = await replitSendEmail({
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: att.content.toString('base64'),
          encoding: 'base64' as const,
        })),
      });

      console.log('✅ Email sent via Replit Mail:', result.messageId);
      console.log('   Accepted:', result.accepted);
      return true;
    } catch (error: any) {
      console.error('❌ Email send error:', error.message);
      return false;
    }
  }

  async sendBookingConfirmation(
    booking: any,
    customer: any,
    product: any,
    locale: string = 'en'
  ): Promise<boolean> {
    const subject = this.getSubject('booking_confirmation', locale);
    const html = this.getBookingConfirmationTemplate(booking, customer, product, locale);

    return this.sendEmail({
      to: customer.email,
      subject,
      html,
    });
  }

  async sendBookingReminder(
    booking: any,
    customer: any,
    product: any,
    locale: string = 'en'
  ): Promise<boolean> {
    const subject = this.getSubject('booking_reminder', locale);
    const html = this.getBookingReminderTemplate(booking, customer, product, locale);

    return this.sendEmail({
      to: customer.email,
      subject,
      html,
    });
  }

  async sendVoucherEmail(
    booking: any,
    customer: any,
    product: any,
    voucherPdf: Buffer,
    locale: string = 'en'
  ): Promise<boolean> {
    const subject = this.getSubject('voucher', locale);
    const html = this.getVoucherTemplate(booking, customer, product, locale);

    return this.sendEmail({
      to: customer.email,
      subject,
      html,
      attachments: [
        {
          filename: `YYD-Voucher-${booking.bookingNumber}.pdf`,
          content: voucherPdf,
        },
      ],
    });
  }

  private getSubject(type: string, locale: string): string {
    const subjects: Record<string, Record<string, string>> = {
      booking_confirmation: {
        en: 'Your YYD Tour Booking Confirmation',
        pt: 'Confirmação de Reserva YYD',
        es: 'Confirmación de Reserva YYD',
      },
      booking_reminder: {
        en: 'Reminder: Your YYD Tour Tomorrow!',
        pt: 'Lembrete: Seu Tour YYD Amanhã!',
        es: '¡Recordatorio: Tu Tour YYD Mañana!',
      },
      voucher: {
        en: 'Your YYD Tour Voucher',
        pt: 'Seu Voucher YYD',
        es: 'Tu Voucher YYD',
      },
    };

    return subjects[type]?.[locale] || subjects[type]?.['en'] || 'YYD Notification';
  }

  private getBookingConfirmationTemplate(
    booking: any,
    customer: any,
    product: any,
    locale: string
  ): string {
    const translations: Record<string, any> = {
      en: {
        greeting: 'Hello',
        thanks: 'Thank you for booking with Yes You Deserve!',
        details: 'Booking Details',
        bookingNumber: 'Booking Number',
        tour: 'Tour',
        date: 'Date',
        time: 'Time',
        people: 'Number of People',
        price: 'Total Price',
        pickup: 'Pickup Location',
        nextSteps: 'What\'s Next?',
        nextStep1: 'You will receive a payment link shortly',
        nextStep2: 'After payment, your voucher will be emailed to you',
        nextStep3: 'We will contact you 24h before your tour to confirm',
        questions: 'Questions? Reply to this email or WhatsApp us',
        signature: 'The YYD Team',
      },
      pt: {
        greeting: 'Olá',
        thanks: 'Obrigado por reservar com Yes You Deserve!',
        details: 'Detalhes da Reserva',
        bookingNumber: 'Número da Reserva',
        tour: 'Tour',
        date: 'Data',
        time: 'Horário',
        people: 'Número de Pessoas',
        price: 'Preço Total',
        pickup: 'Local de Embarque',
        nextSteps: 'Próximos Passos',
        nextStep1: 'Você receberá um link de pagamento em breve',
        nextStep2: 'Após o pagamento, seu voucher será enviado por email',
        nextStep3: 'Entraremos em contato 24h antes do tour para confirmar',
        questions: 'Dúvidas? Responda este email ou WhatsApp',
        signature: 'Equipe YYD',
      },
      es: {
        greeting: 'Hola',
        thanks: '¡Gracias por reservar con Yes You Deserve!',
        details: 'Detalles de la Reserva',
        bookingNumber: 'Número de Reserva',
        tour: 'Tour',
        date: 'Fecha',
        time: 'Hora',
        people: 'Número de Personas',
        price: 'Precio Total',
        pickup: 'Lugar de Recogida',
        nextSteps: 'Próximos Pasos',
        nextStep1: 'Recibirás un enlace de pago pronto',
        nextStep2: 'Después del pago, tu voucher será enviado por email',
        nextStep3: 'Te contactaremos 24h antes del tour para confirmar',
        questions: '¿Preguntas? Responde este email o WhatsApp',
        signature: 'Equipo YYD',
      },
    };

    const t = translations[locale] || translations['en'];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Montserrat', sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #37C8C4 0%, #23C0E3 100%); color: white; padding: 40px 30px; text-align: center; }
          .logo { font-family: 'Pacifico', cursive; font-size: 28px; margin: 0; }
          .content { background: white; padding: 30px; }
          .detail-row { margin: 15px 0; padding: 10px; background: #f9f9f9; border-left: 4px solid #37C8C4; }
          .label { font-weight: bold; color: #7E3231; }
          .value { color: #333; }
          .footer { background: #2a2a2a; padding: 30px; text-align: center; color: #fff; }
          .steps { background: #fff8e1; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .steps ol { margin: 10px 0; padding-left: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">Yes, you deserve.</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px;">${t.greeting} <strong>${customer.name}</strong>,</p>
            <p>${t.thanks}</p>
            
            <h2 style="color: #37C8C4; margin-top: 30px;">${t.details}</h2>
            <div class="detail-row">
              <span class="label">${t.bookingNumber}:</span>
              <span class="value" style="float: right;">${booking.bookingNumber}</span>
            </div>
            <div class="detail-row">
              <span class="label">${t.tour}:</span>
              <span class="value" style="float: right;">${product.titleEn || product.titlePt || product.titleEs}</span>
            </div>
            <div class="detail-row">
              <span class="label">${t.date}:</span>
              <span class="value" style="float: right;">${new Date(booking.date).toLocaleDateString(locale)}</span>
            </div>
            <div class="detail-row">
              <span class="label">${t.time}:</span>
              <span class="value" style="float: right;">${booking.startTime}</span>
            </div>
            <div class="detail-row">
              <span class="label">${t.people}:</span>
              <span class="value" style="float: right;">${booking.numberOfPeople}</span>
            </div>
            <div class="detail-row">
              <span class="label">${t.price}:</span>
              <span class="value" style="float: right;"><strong>€${booking.priceEur}</strong></span>
            </div>
            ${booking.pickupLocation ? `
            <div class="detail-row">
              <span class="label">${t.pickup}:</span>
              <span class="value" style="float: right;">${booking.pickupLocation}</span>
            </div>
            ` : ''}
            
            <div class="steps">
              <h3 style="color: #E9C46A; margin-top: 0;">${t.nextSteps}</h3>
              <ol>
                <li>${t.nextStep1}</li>
                <li>${t.nextStep2}</li>
                <li>${t.nextStep3}</li>
              </ol>
            </div>
            
            <p style="margin-top: 30px; color: #666;">${t.questions}</p>
          </div>
          <div class="footer">
            <p style="font-size: 16px; margin: 0 0 10px 0;"><strong>${t.signature}</strong></p>
            <p style="margin: 0; font-size: 14px; color: #ccc;">Premium Electric Tuk-Tuk Tours • Sintra & Cascais, Portugal</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getBookingReminderTemplate(
    booking: any,
    customer: any,
    product: any,
    locale: string
  ): string {
    const t = locale === 'pt' ? {
      title: 'Seu Tour é Amanhã!',
      greeting: 'Olá',
      reminder: 'Este é um lembrete amigável de que seu tour YYD está agendado para amanhã:',
      tour: 'Tour',
      date: 'Data',
      time: 'Horário',
      pickup: 'Local de Embarque',
      seeYou: 'Estamos ansiosos para vê-lo!',
      team: 'Equipe YYD',
    } : locale === 'es' ? {
      title: '¡Tu Tour es Mañana!',
      greeting: 'Hola',
      reminder: 'Este es un recordatorio amistoso de que tu tour YYD está programado para mañana:',
      tour: 'Tour',
      date: 'Fecha',
      time: 'Hora',
      pickup: 'Lugar de Recogida',
      seeYou: '¡Esperamos verte!',
      team: 'Equipo YYD',
    } : {
      title: 'Your Tour is Tomorrow!',
      greeting: 'Hello',
      reminder: 'This is a friendly reminder that your YYD tour is scheduled for tomorrow:',
      tour: 'Tour',
      date: 'Date',
      time: 'Time',
      pickup: 'Pickup Location',
      seeYou: 'We look forward to seeing you!',
      team: 'The YYD Team',
    };

    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Montserrat, sans-serif; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: white;">
          <div style="background: linear-gradient(135deg, #37C8C4 0%, #23C0E3 100%); color: white; padding: 40px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px;">⏰ ${t.title}</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 18px;">${t.greeting} <strong>${customer.name}</strong>,</p>
            <p>${t.reminder}</p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>${t.tour}:</strong> ${product.titleEn || product.titlePt || product.titleEs}</p>
              <p><strong>${t.date}:</strong> ${new Date(booking.date).toLocaleDateString(locale)}</p>
              <p><strong>${t.time}:</strong> ${booking.startTime}</p>
              <p><strong>${t.pickup}:</strong> ${booking.pickupLocation}</p>
            </div>
            <p style="font-size: 18px; color: #37C8C4;"><strong>${t.seeYou}</strong></p>
            <p>${t.team}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getVoucherTemplate(
    booking: any,
    customer: any,
    product: any,
    locale: string
  ): string {
    const t = locale === 'pt' ? {
      title: 'Seu Voucher YYD',
      greeting: 'Olá',
      thanks: 'Obrigado pelo pagamento! Seu voucher de tour está anexo a este email.',
      present: 'Por favor apresente este voucher (digital ou impresso) quando chegar para o tour.',
      seeYou: 'Até breve!',
      team: 'Equipe YYD',
    } : locale === 'es' ? {
      title: 'Tu Voucher YYD',
      greeting: 'Hola',
      thanks: '¡Gracias por tu pago! Tu voucher de tour está adjunto a este email.',
      present: 'Por favor presenta este voucher (digital o impreso) cuando llegues al tour.',
      seeYou: '¡Hasta pronto!',
      team: 'Equipo YYD',
    } : {
      title: 'Your YYD Tour Voucher',
      greeting: 'Hello',
      thanks: 'Thank you for your payment! Your tour voucher is attached to this email.',
      present: 'Please present this voucher (digital or printed) when you arrive for your tour.',
      seeYou: 'See you soon!',
      team: 'The YYD Team',
    };

    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Montserrat, sans-serif; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #E9C46A 0%, #FFD700 100%); padding: 40px; text-align: center;">
            <h1 style="margin: 0; color: #2a2a2a;">🎟️ ${t.title}</h1>
          </div>
          <div style="padding: 30px; background: white;">
            <p style="font-size: 18px;">${t.greeting} <strong>${customer.name}</strong>,</p>
            <p>${t.thanks}</p>
            <p>${t.present}</p>
            <p style="font-size: 18px; color: #37C8C4; margin-top: 30px;"><strong>${t.seeYou}</strong></p>
            <p>${t.team}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
