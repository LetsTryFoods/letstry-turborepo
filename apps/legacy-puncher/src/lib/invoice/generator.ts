import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import { LegacyOrder } from '../logistics/types';

export async function generateInvoice(order: LegacyOrder): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      await generateHeader(doc);
      generateCustomerInformation(doc, order);
      generateInvoiceTable(doc, order);
      generateFooter(doc);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

async function generateHeader(doc: PDFKit.PDFDocument) {
  const logoPath = path.join(process.cwd(), 'public/assets/logo.avif');

  if (fs.existsSync(logoPath)) {
    try {
      const logoBuffer = await sharp(logoPath).png().toBuffer();
      doc.image(logoBuffer, 50, 45, { width: 100 });
    } catch (error) {
      console.error('Failed to process logo', error);
    }
  }
  doc
    .fillColor('#444444')
    .fontSize(16)
    .text('Lets Try', 110, 45, { align: 'right' })
    .fontSize(8)
    .text('Earth Crust Pvt Ltd', 200, 70, { align: 'right' })
    .text('CIN: U15549DL2020PTC365385', 200, 80, { align: 'right' })
    .text('329, 1st Floor, Indra Vihar, Delhi-110009', 200, 90, { align: 'right' })
    .moveDown();
}

function generateCustomerInformation(doc: PDFKit.PDFDocument, order: LegacyOrder) {
  doc.fillColor('#444444').fontSize(16).text('Invoice', 50, 150);
  generateHr(doc, 175);

  const customerInfoTop = 185;
  const address = order.address;

  doc
    .fontSize(8)
    .text('Order ID:', 50, customerInfoTop)
    .font('Helvetica-Bold')
    .text(order.orderId, 120, customerInfoTop)
    .font('Helvetica')
    .text('Invoice Date:', 50, customerInfoTop + 12)
    .text(new Date(typeof order.createdAt === 'string' ? order.createdAt : order.createdAt.$date).toLocaleDateString(), 120, customerInfoTop + 12)
    .text('Payment Method:', 50, customerInfoTop + 24)
    .text('Prepaid', 120, customerInfoTop + 24)

    .font('Helvetica-Bold')
    .text(address.recipientName, 300, customerInfoTop)
    .font('Helvetica');

  let currentY = customerInfoTop + 12;
  const addressLines = [
    address.buildingName,
    address.street,
    address.floor ? `Floor ${address.floor}` : '',
    address.landmark ? `Landmark: ${address.landmark}` : '',
    `${address.city}, ${address.state} - ${address.pincode}`,
  ].filter(Boolean);

  addressLines.forEach((line) => {
    doc.text(line, 300, currentY, { width: 250 });
    currentY += 12;
  });

  doc.text(address.recipientPhoneNumber, 300, currentY);
}

function generateInvoiceTable(doc: PDFKit.PDFDocument, order: LegacyOrder) {
  let currentY = 270;

  doc.font('Helvetica-Bold').fontSize(8);
  generateTableRow(doc, currentY, 'Item', 'Description', 'Unit Cost', 'Qty', 'Line Total');
  generateHr(doc, currentY + 15);
  doc.font('Helvetica');
  currentY += 20;

  order.items.forEach((item) => {
    const lineTotal = item.price * item.quantity;
    generateTableRow(
      doc,
      currentY,
      item.name,
      item.variant || '',
      `INR ${item.price}`,
      item.quantity,
      `INR ${lineTotal}`
    );
    currentY += 20;
    generateHr(doc, currentY);
    currentY += 10;
  });

  currentY += 10;
  generateSummaryRow(doc, currentY, 'Total', `INR ${order.totalAmount}`);
}

function generateSummaryRow(doc: PDFKit.PDFDocument, y: number, label: string, value: string) {
  doc.fontSize(8).text(label, 330, y, { width: 130, align: 'right' }).text(value, 460, y, { align: 'right' });
}

function generateFooter(doc: PDFKit.PDFDocument) {
  doc.fontSize(10).text('Thank you for your business.', 50, 780, { align: 'center', width: 500 });
}

function generateTableRow(doc: PDFKit.PDFDocument, y: number, item: string, desc: string, cost: string, qty: string | number, total: string) {
  doc
    .fontSize(8)
    .text(item, 50, y, { width: 140 })
    .text(desc, 190, y, { width: 140 })
    .text(cost, 330, y, { width: 80, align: 'right' })
    .text(qty.toString(), 410, y, { width: 50, align: 'right' })
    .text(total, 460, y, { align: 'right' });
}

function generateHr(doc: PDFKit.PDFDocument, y: number) {
  doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}
