import { Injectable, Logger } from '@nestjs/common';
import { Order } from '../order.schema';
import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  async generateInvoice(order: any): Promise<Buffer> {
    this.logger.log(
      `Starting PDF generation for Order: ${order.orderId} (ID: ${order._id})`,
    );
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          this.logger.log(
            `PDF generation completed for Order: ${order.orderId}`,
          );
          resolve(Buffer.concat(chunks));
        });
        doc.on('error', (err) => {
          this.logger.error(
            `PDFDoc error for Order: ${order.orderId}: ${err.message}`,
            err.stack,
          );
          reject(err);
        });

        this.logger.debug('Generating Header...');
        await this.generateHeader(doc);

        this.logger.debug('Generating Customer Info...');
        this.generateCustomerInformation(doc, order);

        this.logger.debug('Generating Invoice Table...');
        this.generateInvoiceTable(doc, order);

        this.logger.debug('Generating Footer...');
        this.generateFooter(doc);

        doc.end();
      } catch (error) {
        this.logger.error(
          `Critical failure in generateInvoice for Order: ${order.orderId}: ${error.message}`,
          error.stack,
        );
        reject(error);
      }
    });
  }

  async generateCustomLabel(order: any): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: [400, 600], margin: 30 });
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.rect(0, 0, 400, 60).fill('#1e3a5f');
        doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('DELIVERY LABEL', 30, 20);
        doc.fontSize(10).font('Helvetica').text(`Order #${order.orderId}`, 30, 40);

        // Ship To
        doc.fillColor('#000000');
        let currentY = 80;
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748b').text('SHIP TO', 30, currentY);
        currentY += 15;

        const address = order.shippingAddress;
        const name = address?.fullName || order.customer?.name || order.recipientContact?.name || 'Customer';
        const phone = address?.phone || order.recipientContact?.phone || 'N/A';

        doc.fontSize(16).font('Helvetica-Bold').fillColor('#0f172a').text(name, 30, currentY, { width: 340 });
        currentY += doc.heightOfString(name, { width: 340 }) + 5;
        
        doc.fontSize(12).font('Helvetica').fillColor('#334155').text(`Ph: ${phone}`, 30, currentY, { width: 340 });
        currentY += doc.heightOfString(`Ph: ${phone}`, { width: 340 }) + 10;

        if (address) {
          const lines = [
            address.addressLine1,
            address.addressLine2,
            `${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}`
          ].filter(Boolean);
          
          doc.fontSize(12).font('Helvetica').fillColor('#334155');
          lines.forEach(line => {
            const lineHeight = doc.heightOfString(line, { width: 340 });
            doc.text(line, 30, currentY, { width: 340 });
            currentY += lineHeight + 3;
          });
        }

        currentY += 10;
        this.generateHr(doc, currentY);
        currentY += 20;


        // Items
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748b').text('ITEMS', 30, currentY);
        currentY += 20;

        doc.fontSize(10).fillColor('#0f172a');
        (order.items || []).forEach((item: any) => {
          doc.font('Helvetica').text(item.name, 30, currentY, { width: 280 });
          doc.font('Helvetica-Bold').text(`x${item.quantity}`, 320, currentY, { width: 50, align: 'right' });
          currentY += Math.max(doc.heightOfString(item.name, { width: 280 }), 15) + 5;
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private async generateHeader(doc: PDFKit.PDFDocument) {
    const logoRelPath = 'assets/logo.avif';
    const logoPath = path.join(process.cwd(), logoRelPath);

    this.logger.debug(`Searching for logo at: ${logoPath}`);
    if (fs.existsSync(logoPath)) {
      try {
        this.logger.debug('Converting logo to PNG using sharp...');
        const logoBuffer = await sharp(logoPath).png().toBuffer();
        doc.image(logoBuffer, 50, 45, { width: 100 });
        this.logger.debug('Logo successfully added to PDF');
      } catch (error) {
        this.logger.error(
          `Failed to process logo image at ${logoPath}: ${error.message}`,
          error.stack,
        );
      }
    } else {
      this.logger.warn(`Logo not found at expected path: ${logoPath}`);
    }
    doc
      .fillColor('#444444')
      .fontSize(16)
      .text('Lets Try', 110, 45, { align: 'right' })
      .fontSize(8)
      .text('Earth Crust Pvt Ltd', 200, 70, { align: 'right' })
      .text('CIN: U15549DL2020PTC365385', 200, 80, { align: 'right' })
      .text('329, 1st Floor, Indra Vihar, Delhi-110009', 200, 90, {
        align: 'right',
      })
      .moveDown();
  }

  private generateCustomerInformation(doc: PDFKit.PDFDocument, order: any) {
    doc.fillColor('#444444').fontSize(16).text('Invoice', 50, 150);

    this.generateHr(doc, 175);

    const customerInfoTop = 185;
    const address = order.shippingAddress;

    doc
      .fontSize(8)
      .text('Order ID:', 50, customerInfoTop)
      .font('Helvetica-Bold')
      .text(order.orderId, 120, customerInfoTop)
      .font('Helvetica')
      .text('Invoice Date:', 50, customerInfoTop + 12)
      .text(
        new Date(order.createdAt).toLocaleDateString(),
        120,
        customerInfoTop + 12,
      )
      .text('Payment Method:', 50, customerInfoTop + 24)
      .text(order.payment?.method || 'UPI', 120, customerInfoTop + 24)

      .font('Helvetica-Bold')
      .text(
        address?.fullName ||
        order.customer?.name ||
        order.recipientContact?.name ||
        'Customer',
        300,
        customerInfoTop,
      )
      .font('Helvetica');

    let currentY = customerInfoTop + 12;
    if (address) {
      const addressLines = [
        address.addressLine1,
        address.floor ? `Floor ${address.floor}` : '',
        address.addressLine2,
        address.landmark && address.landmark !== 'N/A'
          ? `Landmark: ${address.landmark}`
          : '',
        `${address.city}, ${address.state} - ${address.pincode}`,
      ].filter(Boolean);

      addressLines.forEach((line) => {
        const lineHeight = doc.heightOfString(line, { width: 250 });
        doc.text(line, 300, currentY, { width: 250 });
        currentY += lineHeight + 2;
      });
    }

    if (address?.phone && address.phone !== 'N/A') {
      doc.text(address.phone, 300, currentY);
    } else if (order.recipientContact?.phone) {
      doc.text(order.recipientContact.phone, 300, currentY);
    }
  }

  private generateInvoiceTable(doc: PDFKit.PDFDocument, order: any) {
    let currentY = 270;
    const pageBottom = doc.page.height - 50;

    doc.font('Helvetica-Bold').fontSize(8);
    this.generateTableRow(
      doc,
      currentY,
      'Item',
      'Description',
      'Unit Cost',
      'Quantity',
      'Line Total',
    );
    this.generateHr(doc, currentY + 15);
    doc.font('Helvetica');
    currentY += 20;

    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];

      const itemNameHeight = doc.heightOfString(item.name, { width: 140 });
      const descHeight = doc.heightOfString(item.variant || '', { width: 140 });
      const rowHeight = Math.max(itemNameHeight, descHeight, 15);

      if (currentY + rowHeight + 25 > pageBottom) {
        doc.addPage();
        currentY = 50;

        doc.font('Helvetica-Bold').fontSize(8);
        this.generateTableRow(
          doc,
          currentY,
          'Item',
          'Description',
          'Unit Cost',
          'Quantity',
          'Line Total',
        );
        this.generateHr(doc, currentY + 15);
        doc.font('Helvetica');
        currentY += 20;
      }

      this.generateTableRow(
        doc,
        currentY,
        item.name,
        item.variant || '',
        `INR ${item.price}`,
        item.quantity,
        `INR ${item.totalPrice}`,
      );

      currentY += rowHeight + 5;
      this.generateHr(doc, currentY);
      currentY += 10;
    }

    if (currentY + 100 > pageBottom) {
      doc.addPage();
      currentY = 50;
    }

    currentY += 10;

    this.generateSummaryRow(doc, currentY, 'Subtotal', `INR ${order.subtotal}`);
    currentY += 15;

    if (order.discount && order.discount !== '0') {
      this.generateSummaryRow(
        doc,
        currentY,
        'Discount',
        `INR -${order.discount}`,
      );
      currentY += 15;
    }

    if (order.deliveryCharge && order.deliveryCharge !== '0') {
      this.generateSummaryRow(
        doc,
        currentY,
        'Delivery',
        `INR ${order.deliveryCharge}`,
      );
      currentY += 15;
    }

    const handlingCharge =
      order.handlingCharge ||
      order.payment?.handlingCharge ||
      order.metadata?.handlingCharge;
    if (handlingCharge && handlingCharge !== '0' && handlingCharge !== 0) {
      this.generateSummaryRow(
        doc,
        currentY,
        'Handling Charges',
        `INR ${handlingCharge}`,
      );
      currentY += 15;
    }

    currentY += 5;
    doc.font('Helvetica-Bold');
    this.generateSummaryRow(doc, currentY, 'Total', `INR ${order.totalAmount}`);
    doc.font('Helvetica');
  }

  private generateSummaryRow(
    doc: PDFKit.PDFDocument,
    y: number,
    label: string,
    value: string,
  ) {
    doc
      .fontSize(8)
      .text(label, 330, y, { width: 130, align: 'right' })
      .text(value, 460, y, { align: 'right' });
  }

  private generateFooter(doc: PDFKit.PDFDocument) {
    // Footer removed as per user request
  }

  private generateTableRow(
    doc: PDFKit.PDFDocument,
    y: number,
    item: string,
    description: string,
    unitCost: string,
    quantity: string | number,
    lineTotal: string,
  ) {
    doc
      .fontSize(8)
      .text(item, 50, y, { width: 140 })
      .text(description, 190, y, { width: 140 })
      .text(unitCost, 330, y, { width: 80, align: 'right' })
      .text(quantity.toString(), 410, y, { width: 50, align: 'right' })
      .text(lineTotal, 460, y, { align: 'right' });
  }

  private generateHr(doc: PDFKit.PDFDocument, y: number) {
    doc
      .strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }
}
