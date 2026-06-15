import { Controller, Get, Param, Res, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { OrderService } from './order.service';
import { InvoiceService } from './services/invoice.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('orders')
export class OrderController {
  private readonly logger = new Logger('InvoiceService');

  constructor(
    private readonly orderService: OrderService,
    private readonly invoiceService: InvoiceService,
  ) {}

  @Get(':orderId/invoice')
  @Public()
  async downloadInvoice(
    @Param('orderId') orderId: string,
    @Res() res: Response,
  ) {
    try {
      this.logger.log(
        `Received request to download invoice for Order (Internal ID): ${orderId}`,
      );

      const orderData = await this.orderService.getOrderByInternalId(orderId);
      this.logger.debug(`Fetched base order data: ${orderData.orderId}`);

      this.logger.debug(
        'Resolving secondary order information (Payment, Shipping, Customer, Items)...',
      );
      const [payment, shippingAddress, customer, items] = await Promise.all([
        this.orderService.resolvePayment(orderData).catch((e) => {
          this.logger.warn(
            `Failed to resolve payment for ${orderId}: ${e.message}`,
          );
          return null;
        }),
        this.orderService.resolveShippingAddress(orderData).catch((e) => {
          this.logger.warn(
            `Failed to resolve shipping address for ${orderId}: ${e.message}`,
          );
          return null;
        }),
        this.orderService.resolveCustomer(orderData).catch((e) => {
          this.logger.warn(
            `Failed to resolve customer for ${orderId}: ${e.message}`,
          );
          return null;
        }),
        this.orderService.resolveItems(orderData).catch((e) => {
          this.logger.warn(
            `Failed to resolve items for ${orderId}: ${e.message}`,
          );
          return [];
        }),
      ]);
      this.logger.debug('Secondary order information resolution completed');

      const orderObj = orderData.toObject ? orderData.toObject() : orderData;
      const populatedOrder = {
        ...orderObj,
        payment,
        shippingAddress,
        customer,
        items,
      };

      this.logger.debug('Calling InvoiceService to generate buffer...');
      const buffer = await this.invoiceService.generateInvoice(populatedOrder);
      this.logger.log(
        `Successfully generated and serveing invoice buffer for ${orderData.orderId}`,
      );

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${orderData.orderId}.pdf`,
        'Content-Length': buffer.length,
      });

      res.end(buffer);
    } catch (error) {
      this.logger.error(
        `Failed to handle invoice download for orderId ${orderId}: ${error.message}`,
        error.stack,
      );
      res
        .status(500)
        .json({ message: 'Failed to generate invoice', error: error.message });
    }
  }

  @Get(':orderId/custom-label')
  @Public()
  async downloadCustomLabel(
    @Param('orderId') orderId: string,
    @Res() res: Response,
  ) {
    try {
      const orderData = await this.orderService.getOrderByInternalId(orderId);
      const [shippingAddress, customer, items] = await Promise.all([
        this.orderService.resolveShippingAddress(orderData).catch(() => null),
        this.orderService.resolveCustomer(orderData).catch(() => null),
        this.orderService.resolveItems(orderData).catch(() => []),
      ]);

      const orderObj = orderData.toObject ? orderData.toObject() : orderData;
      const populatedOrder = {
        ...orderObj,
        shippingAddress,
        customer,
        items,
      };

      const buffer = await this.invoiceService.generateCustomLabel(populatedOrder);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=custom-label-${orderData.orderId}.pdf`,
        'Content-Length': buffer.length,
      });

      res.end(buffer);
    } catch (error) {
      this.logger.error(`Failed to handle custom label download: ${error.message}`);
      res.status(500).json({ message: 'Failed to generate custom label', error: error.message });
    }
  }
}
