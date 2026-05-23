import PDFDocument from 'pdfkit';
import { LegacyOrder } from '../logistics/types';

export async function generateDeliveryLabel(order: LegacyOrder): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // A5 size (148mm x 210mm) — matches the sample label proportions
      const doc = new PDFDocument({ size: 'A5', margin: 0 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const pageW = doc.page.width;
      const pageH = doc.page.height;
      const border = 14;

      // Outer border
      doc
        .rect(border, border, pageW - border * 2, pageH - border * 2)
        .lineWidth(1.5)
        .stroke('#000000');

      // Black header bar
      const headerH = 44;
      doc
        .rect(border, border, pageW - border * 2, headerH)
        .fill('#000000');

      // "DELIVERY LABEL" title
      doc
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('DELIVERY LABEL', border, border + 13, {
          width: pageW - border * 2,
          align: 'center',
        });

      const addr = order.address;
      const x = border + 20;
      const contentW = pageW - border * 2 - 40;
      let y = border + headerH + 20;

      // NAME
      doc.fillColor('#555555').font('Helvetica').fontSize(7.5).text('NAME:', x, y);
      y += 11;
      doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(14)
        .text(addr.recipientName.toUpperCase(), x, y, { width: contentW });
      y += 24;

      // PHONE NUMBER
      doc.fillColor('#555555').font('Helvetica').fontSize(7.5).text('PHONE NUMBER:', x, y);
      y += 11;
      doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(14)
        .text(addr.recipientPhoneNumber, x, y, { width: contentW });
      y += 24;

      // DELIVERY ADDRESS
      doc.fillColor('#555555').font('Helvetica').fontSize(7.5).text('DELIVERY ADDRESS:', x, y);
      y += 11;

      const addressLines = [
        addr.buildingName,
        addr.street,
        addr.floor ? `Floor ${addr.floor}` : '',
        addr.landmark ? `Landmark: ${addr.landmark}` : '',
        `${addr.city}, ${addr.state} - ${addr.pincode}`,
      ].filter(Boolean);

      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(11);
      addressLines.forEach((line) => {
        doc.text(line, x, y, { width: contentW });
        y += 15;
      });

      y += 16;

      // Dashed separator
      doc
        .dash(5, { space: 5 })
        .strokeColor('#000000')
        .lineWidth(1.5)
        .moveTo(x, y)
        .lineTo(pageW - border - 20, y)
        .stroke()
        .undash();

      y += 18;

      // ORDER ID
      doc.fillColor('#555555').font('Helvetica').fontSize(7.5).text('ORDER ID', x, y);
      y += 11;
      doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(`#${order.orderId}`, x, y, { width: contentW });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
