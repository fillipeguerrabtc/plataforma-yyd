import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

interface VoucherData {
  bookingNumber: string;
  customerName: string;
  tourTitle: string;
  date: Date;
  time: string;
  numberOfPeople: number;
  pickupLocation: string;
  priceEur: number;
  specialRequests?: string;
  qrCodeUrl?: string;
}

export async function generateVoucherPDF(data: VoucherData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header - YYD Brand Colors
      doc
        .rect(0, 0, doc.page.width, 120)
        .fillAndStroke('#37C8C4', '#37C8C4');

      // Logo text
      doc
        .fillColor('#FFFFFF')
        .fontSize(36)
        .font('Helvetica-Bold')
        .text('Yes, you deserve.', 50, 40, { align: 'center' });

      doc
        .fontSize(12)
        .font('Helvetica')
        .text('Premium Electric Tuk-Tuk Tours • Sintra & Cascais', 50, 85, { align: 'center' });

      // Reset to black for body
      doc.fillColor('#000000');

      // Voucher Title
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('TOUR VOUCHER', 50, 150);

      // Booking number (highlighted)
      doc
        .rect(50, 190, doc.page.width - 100, 40)
        .fillAndStroke('#E9C46A', '#E9C46A');

      doc
        .fillColor('#2a2a2a')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text(`Booking #${data.bookingNumber}`, 60, 203);

      doc.fillColor('#000000');

      // Tour Details
      let yPosition = 260;

      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('Tour Details', 50, yPosition);

      yPosition += 30;

      const details = [
        { label: 'Customer:', value: data.customerName },
        { label: 'Tour:', value: data.tourTitle },
        { label: 'Date:', value: data.date.toLocaleDateString('en-GB') },
        { label: 'Time:', value: data.time },
        { label: 'Number of People:', value: data.numberOfPeople.toString() },
        { label: 'Pickup Location:', value: data.pickupLocation },
        { label: 'Total Price:', value: `R$${data.priceEur}` },
      ];

      details.forEach((detail) => {
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text(detail.label, 50, yPosition, { continued: true, width: 180 })
          .font('Helvetica')
          .text(detail.value, { width: 350 });

        yPosition += 25;
      });

      if (data.specialRequests) {
        yPosition += 10;
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Special Requests:', 50, yPosition);

        yPosition += 20;
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(data.specialRequests, 50, yPosition, { width: 500 });

        yPosition += 40;
      }

      // QR Code
      if (data.qrCodeUrl) {
        try {
          const qrCodeDataUrl = await QRCode.toDataURL(data.qrCodeUrl, {
            width: 150,
            margin: 1,
          });

          // Convert base64 to buffer
          const qrBuffer = Buffer.from(
            qrCodeDataUrl.replace(/^data:image\/png;base64,/, ''),
            'base64'
          );

          yPosition += 20;
          doc.image(qrBuffer, 50, yPosition, { width: 150 });
          doc
            .fontSize(10)
            .text('Scan to view booking', 50, yPosition + 160, { width: 150, align: 'center' });
        } catch (qrError) {
          console.error('QR code generation failed:', qrError);
        }
      }

      // Important Information Box
      const boxY = doc.page.height - 200;
      doc
        .rect(50, boxY, doc.page.width - 100, 120)
        .fillAndStroke('#f4f4f4', '#cccccc');

      doc
        .fillColor('#7E3231')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Important Information', 60, boxY + 10);

      doc
        .fillColor('#333333')
        .fontSize(9)
        .font('Helvetica')
        .text('• Please arrive 10 minutes before your scheduled time', 60, boxY + 35)
        .text('• Present this voucher (digital or printed) to your guide', 60, boxY + 50)
        .text('• Cancellations must be made 24 hours in advance for a full refund', 60, boxY + 65)
        .text('• In case of questions, contact us via WhatsApp or email', 60, boxY + 80)
        .text('• Weather conditions may affect tour availability - we will notify you', 60, boxY + 95);

      // Footer
      doc
        .fontSize(8)
        .fillColor('#999999')
        .text(
          'Generated on ' + new Date().toLocaleString('en-GB'),
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
