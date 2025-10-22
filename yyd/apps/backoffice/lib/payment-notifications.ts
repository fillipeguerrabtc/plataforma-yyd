import { prisma } from './prisma';
import { sendEmail, sendPaymentNotificationEmail } from './email-service';

interface PaymentNotificationParams {
  payrollId: string;
}

export async function sendPaymentNotifications(params: PaymentNotificationParams) {
  try {
    const payroll = await prisma.payroll.findUnique({
      where: { id: params.payrollId },
      include: {
        guide: true,
        staff: true,
        vendor: true,
      },
    });

    if (!payroll) {
      throw new Error('Payroll not found');
    }

    let recipientEmail = '';
    let recipientName = '';

    if (payroll.guide) {
      recipientEmail = payroll.guide.email;
      recipientName = payroll.guide.name;
    } else if (payroll.staff) {
      recipientEmail = payroll.staff.email;
      recipientName = payroll.staff.name;
    } else if (payroll.vendor) {
      recipientEmail = payroll.vendor.contactEmail || '';
      recipientName = payroll.vendor.name;
    }

    if (!recipientEmail) {
      console.warn('⚠️  No recipient email found for payroll', params.payrollId);
      return;
    }

    // Send email to beneficiary
    await sendPaymentNotificationEmail({
      recipientEmail,
      recipientName,
      amount: parseFloat(payroll.netAmount.toString()),
      currency: 'EUR',
      paymentDate: payroll.paidAt || new Date(),
      description: `Pagamento - ${payroll.period}`,
    });

    // Get finance department email
    const financeDept = await prisma.department.findFirst({
      where: { name: { in: ['Finance', 'Financeiro', 'Financial'] } },
      select: { email: true },
    });

    if (financeDept?.email) {
      const financeHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1FB7C4;">Notificação de Pagamento - YYD</h2>
          <p>Um pagamento foi processado:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Beneficiário:</strong> ${recipientName}</p>
            <p><strong>Email:</strong> ${recipientEmail}</p>
            <p><strong>Valor:</strong> EUR ${parseFloat(payroll.netAmount.toString()).toFixed(2)}</p>
            <p><strong>Período:</strong> ${payroll.period}</p>
            <p><strong>Data:</strong> ${(payroll.paidAt || new Date()).toLocaleDateString('pt-PT')}</p>
            <p><strong>Método:</strong> ${payroll.paymentMethod}</p>
          </div>
          <p>Este email foi enviado automaticamente pelo sistema YYD.</p>
        </div>
      `;

      await sendEmail({
        from: 'finance@yyd.tours',
        to: financeDept.email,
        subject: `Pagamento Processado - ${recipientName}`,
        html: financeHtml,
        metadata: {
          type: 'payment_notification_finance',
          payrollId: payroll.id,
          amount: parseFloat(payroll.netAmount.toString()),
        },
      });

      console.log(`✅ Payment notification sent to finance department`);
    }

    console.log(`✅ Payment notifications sent for payroll ${params.payrollId}`);
  } catch (error) {
    console.error('❌ Error sending payment notifications:', error);
    throw error;
  }
}
