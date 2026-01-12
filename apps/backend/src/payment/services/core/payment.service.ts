import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { PaymentEvent, PaymentOrder, PaymentStatus } from '../../entities/payment.schema';
import { PaymentExecutorService } from '../domain/payment-executor.service';
import { RefundService } from './refund.service';
import { PaymentLoggerService } from '../../../common/services/payment-logger.service';
import {
  InitiatePaymentInput,
  ProcessRefundInput,
} from '../../dto/payment.input';
import { CartService } from '../../../cart/cart.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(PaymentEvent.name)
    private paymentEventModel: Model<PaymentEvent>,
    @InjectModel(PaymentOrder.name)
    private paymentOrderModel: Model<PaymentOrder>,
    private readonly paymentExecutorService: PaymentExecutorService,
    private readonly refundService: RefundService,
    private readonly paymentLogger: PaymentLoggerService,
    private readonly configService: ConfigService,
    private readonly cartService: CartService,
  ) { }

  async initiatePayment(identityId: string, input: InitiatePaymentInput, idempotencyKey?: string) {
    try {
      if (idempotencyKey) {
        const existingOrder = await this.paymentOrderModel.findOne({
          identityId,
          idempotencyKey,
          idempotencyKeyExpiresAt: { $gt: new Date() },
        });

        if (existingOrder) {
          const cart = await this.cartService.getCartById(input.cartId);
          
          if (!cart) {
            throw new Error('Cart not found');
          }
          
          const currentAmount = cart.totalsSummary.grandTotal.toString();

          if (existingOrder.amount !== currentAmount) {
            throw new BadRequestException(
              'Cart has changed. Please generate a new idempotency key.',
            );
          }

          return {
            paymentOrderId: existingOrder.paymentOrderId,
            redirectUrl: this.getReturnUrl(),
          };
        }
      }

      const cart = await this.cartService.getCartById(input.cartId);

      if (!cart) {
        throw new Error('Cart not found');
      }

      if (cart.identityId.toString() !== identityId) {
        throw new Error('Unauthorized cart access');
      }

      const amount = cart.totalsSummary.grandTotal.toString();
      const currency = 'INR';

      const paymentEvent = await this.createPaymentEvent({
        cartId: input.cartId,
        identityId,
        amount,
        currency,
      });

      const paymentOrder = await this.createPaymentOrder({
        paymentEventId: paymentEvent._id.toString(),
        identityId,
        amount,
        currency,
        idempotencyKey,
      });

      const paymentData =
        await this.paymentExecutorService.executePaymentOrder({
          paymentOrderId: paymentOrder.paymentOrderId,
          identityId,
          amount,
          currency,
          buyerEmail: `identity_${identityId}@temp.com`,
          buyerName: 'Customer',
          buyerPhone: '9999999999',
          productDescription: 'Order Payment',
          returnUrl: this.getReturnUrl(),
        });

      return {
        paymentOrderId: paymentOrder.paymentOrderId,
        redirectUrl: paymentData.redirectUrl,
      };
    } catch (error) {
      this.handlePaymentError(error, 'Initiation failed');
    }
  }


  async getPaymentStatus(paymentOrderId: string) {
    const paymentOrder = await this.paymentOrderModel.findOne({
      paymentOrderId,
    });

    if (!paymentOrder) {
      throw new NotFoundException('Payment order not found');
    }

    await this.paymentExecutorService.checkPaymentStatus(paymentOrderId);

    const updatedPaymentOrder = await this.paymentOrderModel.findOne({
      paymentOrderId,
    });

    if (!updatedPaymentOrder) {
      throw new NotFoundException('Payment order not found after status check');
    }

    return {
      paymentOrderId,
      status: updatedPaymentOrder.paymentOrderStatus,
      message: updatedPaymentOrder.pspResponseMessage,
      paymentOrder: updatedPaymentOrder,
    };
  }

  async processRefund(identityId: string, input: ProcessRefundInput) {
    const paymentOrder = await this.paymentOrderModel.findOne({
      paymentOrderId: input.paymentOrderId,
    });

    if (!paymentOrder) {
      throw new NotFoundException('Payment order not found');
    }

    if (paymentOrder.identityId.toString() !== identityId) {
      throw new BadRequestException(
        'Unauthorized: This payment does not belong to you',
      );
    }

    if (paymentOrder.paymentOrderStatus !== PaymentStatus.SUCCESS) {
      throw new BadRequestException(
        'Cannot refund: Payment was not successful',
      );
    }

    try {
      const orderAmount = parseFloat(paymentOrder.amount);
      const refundAmount = parseFloat(input.refundAmount);
      const isPartialRefund = refundAmount < orderAmount;

      const refund = await this.refundService.initiateRefund({
        paymentOrderId: input.paymentOrderId,
        refundAmount: input.refundAmount,
        reason: input.reason || 'Customer requested refund',
        isPartialRefund,
      });

      return {
        refundId: refund.refundId,
        status: refund.refundStatus,
        message: refund.pspResponseMessage,
      };
    } catch (error) {
      throw new BadRequestException(`Refund failed: ${error.message}`);
    }
  }

  async getPaymentsByIdentity(
    identityId: string,
    mergedGuestIds: string[] = [],
  ) {
    const identityIds = [identityId, ...mergedGuestIds];

    return this.paymentOrderModel
      .find({
        identityId: { $in: identityIds },
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getPaymentOrderByPaymentOrderId(paymentOrderId: string) {
    const paymentOrder = await this.paymentOrderModel.findOne({
      paymentOrderId,
    });

    if (!paymentOrder) {
      throw new NotFoundException('Payment order not found');
    }

    return paymentOrder;
  }

  private async createPaymentEvent(params: {
    cartId: string;
    identityId: string;
    amount: string;
    currency: string;
  }) {
    const paymentEvent = await this.paymentEventModel.create({
      cartId: params.cartId,
      identityId: params.identityId,
      totalAmount: params.amount,
      currency: params.currency,
      isPaymentDone: false,
    });

    this.paymentLogger.logPaymentInitiation({
      paymentOrderId: paymentEvent._id.toString(),
      userId: params.identityId,
      amount: params.amount,
      currency: params.currency,
    });

    return paymentEvent;
  }

  private async createPaymentOrder(params: {
    paymentEventId: string;
    identityId: string;
    amount: string;
    currency: string;
    idempotencyKey?: string;
  }) {
    return this.paymentOrderModel.create({
      paymentOrderId: this.generatePaymentOrderId(),
      paymentEventId: params.paymentEventId,
      identityId: params.identityId,
      amount: params.amount,
      currency: params.currency,
      paymentOrderStatus: PaymentStatus.NOT_STARTED,
      retryCount: 0,
      idempotencyKey: params.idempotencyKey,
      idempotencyKeyExpiresAt: params.idempotencyKey
        ? new Date(Date.now() + 30 * 60 * 1000)
        : undefined,
    });
  }

  private generatePaymentOrderId(): string {
    return `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getReturnUrl(): string {
    return this.configService.get<string>('zaakpay.returnUrl') || '';
  }

  private handlePaymentError(error: any, context: string): never {
    this.paymentLogger.logPaymentFailure({
      paymentOrderId: 'N/A',
      reason: `${context}: ${error.message}`,
      pspResponseCode: 'N/A',
    });
    throw new BadRequestException(
      `Failed to ${context.toLowerCase()}: ${error.message}`,
    );
  }
}
