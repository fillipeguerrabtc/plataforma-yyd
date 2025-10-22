import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function sendQuickEmail() {
  try {
    console.log('📧 Quick email test to fillipe182@hotmail.com...\n');
    
    // Import email functions
    const { sendEmail } = await import('../lib/replitmail');
    
    // Simple test email (no booking needed)
    const result = await sendEmail({
      to: 'fillipe182@hotmail.com',
      subject: '🎉 YYD Email Test - Replit Mail Working!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1FB7C4 0%, #37C8C4 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 32px;">✅ Success!</h1>
          </div>
          
          <div style="padding: 40px 20px; background: #f9f9f9;">
            <h2 style="color: #1A1A1A;">Replit Mail is Working Perfectly!</h2>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hello Fillipe! 👋
            </p>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              This is a test email from the <strong>YYD Platform</strong> to confirm that 
              the Replit Mail integration is working correctly.
            </p>
            
            <div style="background: white; border-left: 4px solid #1FB7C4; padding: 20px; margin: 20px 0;">
              <p style="margin: 0; color: #333;"><strong>✅ Email Service:</strong> Replit Mail</p>
              <p style="margin: 10px 0 0; color: #333;"><strong>✅ Authentication:</strong> Automatic (REPL_IDENTITY)</p>
              <p style="margin: 10px 0 0; color: #333;"><strong>✅ Status:</strong> Production Ready</p>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Your booking confirmation emails will be sent automatically when customers 
              complete their payments via Stripe.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://yesyoudeserve.tours" 
                 style="background: #1FB7C4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Visit YYD Platform
              </a>
            </div>
          </div>
          
          <div style="background: #1A1A1A; padding: 20px; text-align: center;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © 2025 Yes You Deserve - Premium Electric Tuk-Tuk Tours
            </p>
          </div>
        </div>
      `,
      text: `
        ✅ SUCCESS! Replit Mail is Working!
        
        Hello Fillipe!
        
        This is a test email from the YYD Platform to confirm that the Replit Mail 
        integration is working correctly.
        
        ✅ Email Service: Replit Mail
        ✅ Authentication: Automatic (REPL_IDENTITY)
        ✅ Status: Production Ready
        
        Your booking confirmation emails will be sent automatically when customers 
        complete their payments via Stripe.
        
        © 2025 Yes You Deserve - Premium Electric Tuk-Tuk Tours
      `
    });
    
    console.log('✅ ✅ ✅ EMAIL SENT SUCCESSFULLY! ✅ ✅ ✅');
    console.log('📬 Message ID:', result.messageId);
    console.log('✅ Accepted:', result.accepted);
    if (result.rejected && result.rejected.length > 0) {
      console.log('❌ Rejected:', result.rejected);
    }
    console.log('\n🎉 Check your inbox at fillipe182@hotmail.com!');
    console.log('📧 Also check spam/junk folder just in case.\n');
    
  } catch (error: any) {
    console.error('\n❌ EMAIL SEND FAILED:');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

sendQuickEmail();
