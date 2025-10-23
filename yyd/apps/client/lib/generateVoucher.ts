import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

interface VoucherData {
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  tourTitle: string;
  date: Date;
  startTime: string;
  numberOfPeople: number;
  priceEur: number;
  specialRequests?: string;
}

export async function generateVoucherPDF(data: VoucherData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Generate QR code
      const qrCodeData = `YYD-${data.bookingNumber}`;
      const qrCodeImage = await QRCode.toDataURL(qrCodeData);

      // Header with YYD branding
      doc
        .fontSize(28)
        .fillColor('#23C0E3')
        .font('Helvetica-Bold')
        .text('Yes, You Deserve!', { align: 'center' });

      doc
        .moveDown(0.5)
        .fontSize(12)
        .fillColor('#333333')
        .font('Helvetica')
        .text('Premium Tuk Tuk Tours in Sintra & Cascais', { align: 'center' });

      doc.moveDown(2);

      // Title
      doc
        .fontSize(20)
        .fillColor('#333333')
        .font('Helvetica-Bold')
        .text('TOUR VOUCHER', { align: 'center' });

      doc.moveDown(1);

      // Booking details box
      doc
        .fontSize(12)
        .fillColor('#666666')
        .font('Helvetica')
        .text(`Booking Number: `, { continued: true })
        .font('Helvetica-Bold')
        .fillColor('#23C0E3')
        .text(data.bookingNumber);

      doc.moveDown(1.5);

      // Customer information
      doc
        .fillColor('#333333')
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('Customer Information');

      doc
        .moveDown(0.5)
        .fontSize(11)
        .font('Helvetica')
        .text(`Name: ${data.customerName}`)
        .text(`Email: ${data.customerEmail}`);

      doc.moveDown(1.5);

      // Tour information
      doc
        .fillColor('#333333')
        .font('Helvetica-Bold')
        .fontSize(14)
        .text('Tour Details');

      doc
        .moveDown(0.5)
        .fontSize(11)
        .font('Helvetica')
        .text(`Tour: ${data.tourTitle}`)
        .text(`Date: ${new Date(data.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`)
        .text(`Time: ${data.startTime}`)
        .text(`Number of People: ${data.numberOfPeople}`)
        .text(`Total Price: R$${parseFloat(data.priceEur.toString())}`);

      if (data.specialRequests) {
        doc
          .moveDown(0.5)
          .text(`Special Requests: ${data.specialRequests}`);
      }

      doc.moveDown(2);

      // QR Code
      const qrX = (doc.page.width - 150) / 2;
      doc.image(qrCodeImage, qrX, doc.y, { width: 150, height: 150 });

      doc.moveDown(10);

      doc
        .fontSize(10)
        .fillColor('#666666')
        .font('Helvetica')
        .text('Scan this QR code for quick check-in', { align: 'center' });

      doc.moveDown(3);

      // Important information
      doc
        .fontSize(11)
        .fillColor('#333333')
        .font('Helvetica-Bold')
        .text('Important Information:');

      doc
        .moveDown(0.5)
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#666666')
        .text('• Please arrive 10 minutes before your scheduled tour time')
        .text('• Bring a printed or digital copy of this voucher')
        .text('• Comfortable shoes and sunscreen are recommended')
        .text('• Free cancellation up to 48 hours before the tour');

      doc.moveDown(2);

      // Footer
      doc
        .fontSize(9)
        .fillColor('#999999')
        .text('Yes, You Deserve! | Sintra & Cascais, Portugal', { align: 'center' })
        .text('WhatsApp: +351 XXX XXX XXX | Email: contact@yesyoudeserve.tours', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
