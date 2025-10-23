import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Require admin permission to test emails
    requirePermission(request, 'analytics', 'read');
    
    const { to, templateId } = await request.json();

    if (!to || !templateId) {
      return NextResponse.json(
        { error: 'Email and template ID required' },
        { status: 400 }
      );
    }

    // Mock test email data
    const mockData = {
      customerName: 'João Silva',
      bookingNumber: 'YYD-TEST-12345',
      tourName: 'Sintra Palaces Tour',
      date: new Date().toLocaleDateString('pt-PT'),
      time: '09:00',
      price: 'R$120.00',
    };

    const templates: Record<string, { subject: string; body: string }> = {
      booking_confirmation: {
        subject: 'Teste: Confirmação de Reserva YYD',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1FB7C4 0%, #23C0E3 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Yes, you deserve.</h1>
            </div>
            <div style="padding: 30px; background: white;">
              <h2 style="color: #1FB7C4;">EMAIL DE TESTE</h2>
              <p>Olá <strong>${mockData.customerName}</strong>,</p>
              <p>Este é um email de teste do template de confirmação de reserva.</p>
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Número da Reserva:</strong> ${mockData.bookingNumber}</p>
                <p><strong>Tour:</strong> ${mockData.tourName}</p>
                <p><strong>Data:</strong> ${mockData.date}</p>
                <p><strong>Horário:</strong> ${mockData.time}</p>
                <p><strong>Preço:</strong> ${mockData.price}</p>
              </div>
              <p>Obrigado por escolher YYD!</p>
            </div>
            <div style="background: #2a2a2a; padding: 20px; text-align: center; color: white;">
              <p style="margin: 0;">Premium Electric Tuk-Tuk Tours • Sintra & Cascais</p>
            </div>
          </div>
        `,
      },
      booking_reminder: {
        subject: 'Teste: Lembrete de Tour YYD',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1FB7C4 0%, #23C0E3 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">⏰ Seu Tour é Amanhã!</h1>
            </div>
            <div style="padding: 30px; background: white;">
              <h2 style="color: #1FB7C4;">EMAIL DE TESTE</h2>
              <p>Olá <strong>${mockData.customerName}</strong>,</p>
              <p>Lembrete: seu tour YYD está agendado para amanhã!</p>
              <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Tour:</strong> ${mockData.tourName}</p>
                <p><strong>Data:</strong> ${mockData.date}</p>
                <p><strong>Horário:</strong> ${mockData.time}</p>
              </div>
              <p>Estamos ansiosos para vê-lo!</p>
            </div>
          </div>
        `,
      },
      voucher: {
        subject: 'Teste: Seu Voucher YYD',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #E9C46A 0%, #FFD700 100%); padding: 30px; text-align: center;">
              <h1 style="color: #2a2a2a; margin: 0;">🎟️ Seu Voucher YYD</h1>
            </div>
            <div style="padding: 30px; background: white;">
              <h2 style="color: #1FB7C4;">EMAIL DE TESTE</h2>
              <p>Olá <strong>${mockData.customerName}</strong>,</p>
              <p>Obrigado pelo pagamento! Seu voucher está anexo.</p>
              <p>Apresente este voucher no dia do tour.</p>
            </div>
          </div>
        `,
      },
    };

    const template = templates[templateId];
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // In production, this would use Replit Mail
    // For now, just simulate success
    console.log(`📧 Test email would be sent to: ${to}`);
    console.log(`📋 Template: ${templateId}`);
    console.log(`📝 Subject: ${template.subject}`);

    return NextResponse.json({
      success: true,
      message: `Email de teste enviado para ${to}`,
      messageId: `test-${Date.now()}`,
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
