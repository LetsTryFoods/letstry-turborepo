import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentOrder, PaymentStatus } from '../../entities/payment.schema';
import { ZaakpayGatewayService } from '../../gateways/zaakpay/zaakpay-gateway.service';
import { LedgerService } from '../core/ledger.service';
import { PaymentLoggerService } from '../../../common/services/payment-logger.service';
import { OrderService } from '../../../order/order.service';
import { CartService } from '../../../cart/cart.service';
import { OrderCartLoggerService } from '../../../order/order-cart-logger.service';
import { Identity, IdentityDocument } from '../../../common/schemas/identity.schema';

@Injectable()
export class PaymentExecutorService {
  constructor(
    @InjectModel(PaymentOrder.name)
    private paymentOrderModel: Model<PaymentOrder>,
    private zaakpayGateway: ZaakpayGatewayService,
    private ledgerService: LedgerService,
    private paymentLogger: PaymentLoggerService,
    private orderService: OrderService,
    private cartService: CartService,
    private orderCartLogger: OrderCartLoggerService,
    @InjectModel(Identity.name)
    private identityModel: Model<IdentityDocument>,
  ) { }

  async executePaymentOrder(params: {
    paymentOrderId: string;
    identityId: string;
    amount: string;
    currency: string;
    buyerEmail: string;
    buyerName: string;
    buyerPhone: string;
    productDescription: string;
    returnUrl: string;
  }): Promise<{
    redirectUrl: string;
  }> {
    this.paymentLogger.logPaymentExecution({
      paymentOrderId: params.paymentOrderId,
      pspOrderId: params.paymentOrderId,
      status: PaymentStatus.EXECUTING,
    });

    await this.paymentOrderModel.findOneAndUpdate(
      { paymentOrderId: params.paymentOrderId },
      {
        paymentOrderStatus: PaymentStatus.EXECUTING,
        executedAt: new Date(),
      },
    );

    const paymentData = await this.zaakpayGateway.initiatePayment({
      orderId: params.paymentOrderId,
      amount: params.amount,
      buyerEmail: params.buyerEmail,
      buyerName: params.buyerName,
      buyerPhone: params.buyerPhone,
      productDescription: params.productDescription,
      returnUrl: params.returnUrl,
    });

    await this.paymentOrderModel.findOneAndUpdate(
      { paymentOrderId: params.paymentOrderId },
      {
        zaakpayOrderId: params.paymentOrderId,
      },
    );

    return {
      redirectUrl: paymentData.redirectUrl,
    };
  }

  async handlePaymentSuccess(params: {
    paymentOrderId: string;
    pspTxnId: string;
    paymentMethod: string;
    bankTxnId?: string;
    cardType?: string;
    cardNumber?: string;
    pspRawResponse: any;
  }): Promise<void> {
    const paymentOrder = await this.paymentOrderModel.findOne({
      paymentOrderId: params.paymentOrderId,
    });

    if (!paymentOrder) {
      throw new Error('Payment order not found');
    }

    await this.paymentOrderModel.findOneAndUpdate(
      { paymentOrderId: params.paymentOrderId },
      {
        paymentOrderStatus: PaymentStatus.SUCCESS,
        pspTxnId: params.pspTxnId,
        paymentMethod: params.paymentMethod,
        bankTxnId: params.bankTxnId,
        cardType: params.cardType,
        cardNumber: params.cardNumber,
        paymentMode: params.pspRawResponse.paymentMode,
        cardScheme: params.pspRawResponse.cardScheme,
        cardToken: params.pspRawResponse.cardToken,
        bankName: params.pspRawResponse.bank,
        bankId: params.pspRawResponse.bankid,
        paymentMethodId: params.pspRawResponse.paymentmethod,
        cardHashId: params.pspRawResponse.cardhashId,
        productDescription: params.pspRawResponse.productDescription,
        pspTxnTime: params.pspRawResponse.pgTransTime ? new Date(params.pspRawResponse.pgTransTime) : undefined,
        pspRawResponse: params.pspRawResponse,
        pspResponseCode: params.pspRawResponse.responseCode,
        pspResponseMessage: params.pspRawResponse.responseDescription,
        completedAt: new Date(),
      },
    );

    await this.ledgerService.recordPaymentTransaction({
      paymentOrderId: params.paymentOrderId,
      identityId: paymentOrder.identityId.toString(),
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
    });

    await this.paymentOrderModel.findOneAndUpdate(
      { paymentOrderId: params.paymentOrderId },
      { ledgerUpdated: true },
    );

    await this.createOrderAndClearCart(paymentOrder);

    this.paymentLogger.logPaymentSuccess({
      paymentOrderId: params.paymentOrderId,
      pspTxnId: params.pspTxnId,
      amount: paymentOrder.amount,
    });
  }

  private async createOrderAndClearCart(paymentOrder: any): Promise<void> {
    const paymentEvent = await this.getPaymentEvent(
      paymentOrder.paymentEventId,
    );

    if (!paymentEvent) {
      this.paymentLogger.error('Payment event not found', '', {
        paymentOrderId: paymentOrder.paymentOrderId,
      });
      this.orderCartLogger.logPaymentEventNotFound(paymentOrder.paymentOrderId);
      return;
    }

    const cart = await this.getCartDetails(paymentEvent.cartId);

    if (!cart) {
      this.paymentLogger.error('Cart not found', '', {
        cartId: paymentEvent.cartId,
      });
      this.orderCartLogger.logCartNotFound(paymentEvent.cartId.toString());
      return;
    }

    // Fetch identity data for authenticated users
    let placerContact: { phone?: string; email?: string } | undefined = undefined;
    if (paymentOrder.identityId) {
      const identity = await this.identityModel
        .findById(paymentOrder.identityId)
        .exec();
      if (identity) {
        placerContact = {
          phone: identity.phoneNumber,
          email: identity.email,
        };
      }
    }

    try {
      this.orderCartLogger.logOrderCreationStart(
        paymentOrder.paymentOrderId,
        paymentEvent.cartId.toString(),
      );

      const order = await this.orderService.createOrder({
        identityId: paymentOrder.identityId
          ? paymentOrder.identityId.toString()
          : undefined,
        paymentOrderId: paymentOrder.paymentOrderId,
        cartId: paymentEvent.cartId.toString(),
        totalAmount: paymentOrder.amount,
        currency: paymentOrder.currency,
        shippingAddressId: cart.shippingAddressId?.toString(),
        placerContact:
          placerContact ||
          (paymentOrder.identityId ? undefined : { phone: paymentOrder.phone }), // For guests, use payment phone as placer if provided
        recipientContact: {
          phone: cart.recipientPhone || paymentOrder.phone || 'N/A',
        }, // Assume cart has recipientPhone, fallback to payment phone
        items: cart.items.map((item: any) => ({
          itemId: item.productId?.toString() || item.productId,
          quantity: item.quantity || 0,
        })),
      });

      this.orderCartLogger.logOrderCreated(
        order.orderId,
        paymentOrder.paymentOrderId,
        cart.items.length,
        paymentOrder.amount,
      );

      this.orderCartLogger.logCartClearStart(
        paymentOrder.identityId.toString(),
        paymentEvent.cartId.toString(),
      );

      await this.cartService.clearCart(paymentOrder.identityId.toString());

      this.orderCartLogger.logCartCleared(
        paymentOrder.identityId.toString(),
        cart.items.length,
      );
    } catch (error) {
      this.orderCartLogger.logOrderCreationError(error.message, {
        paymentOrderId: paymentOrder.paymentOrderId,
        cartId: paymentEvent.cartId.toString(),
        stack: error.stack,
      });
      throw error;
    }
  }

  private async getPaymentEvent(paymentEventId: any): Promise<any> {
    const PaymentEvent = this.paymentOrderModel.db.model('PaymentEvent');
    return PaymentEvent.findById(paymentEventId);
  }

  private async getCartDetails(cartId: any): Promise<any> {
    const Cart = this.paymentOrderModel.db.model('Cart');
    return Cart.findById(cartId);
  }

  async handlePaymentFailure(params: {
    paymentOrderId: string;
    failureReason: string;
    pspResponseCode?: string;
    pspResponseMessage?: string;
    pspRawResponse?: any;
  }): Promise<void> {
    await this.paymentOrderModel.findOneAndUpdate(
      { paymentOrderId: params.paymentOrderId },
      {
        paymentOrderStatus: PaymentStatus.FAILED,
        failureReason: params.failureReason,
        pspResponseCode: params.pspResponseCode,
        pspResponseMessage: params.pspResponseMessage,
        pspRawResponse: params.pspRawResponse,
        completedAt: new Date(),
      },
    );

    this.paymentLogger.logPaymentFailure({
      paymentOrderId: params.paymentOrderId,
      reason: params.failureReason,
      pspResponseCode: params.pspResponseCode,
    });
  }

  async handlePaymentPending(params: {
    paymentOrderId: string;
    pspResponseMessage?: string;
  }): Promise<void> {
    await this.paymentOrderModel.findOneAndUpdate(
      { paymentOrderId: params.paymentOrderId },
      {
        paymentOrderStatus: PaymentStatus.PENDING,
        pspResponseMessage: params.pspResponseMessage,
      },
    );

    this.paymentLogger.log('Payment pending', {
      paymentOrderId: params.paymentOrderId,
      message: params.pspResponseMessage,
    });
  }

  async checkPaymentStatus(
    paymentOrderId: string,
  ): Promise<{ status: PaymentStatus; details: any }> {
    const paymentOrder = await this.paymentOrderModel.findOne({
      paymentOrderId,
    });

    if (!paymentOrder) {
      throw new Error('Payment order not found');
    }

    if (
      paymentOrder.paymentOrderStatus === PaymentStatus.SUCCESS ||
      paymentOrder.paymentOrderStatus === PaymentStatus.FAILED
    ) {
      return {
        status: paymentOrder.paymentOrderStatus,
        details: paymentOrder,
      };
    }

    const zaakpayStatus = await this.zaakpayGateway.checkTransactionStatus({
      orderId: paymentOrderId,
    });

    if (zaakpayStatus.success && zaakpayStatus.orders?.length > 0) {
      const order = zaakpayStatus.orders[0];

      if (order.txnStatus === '0') {
        await this.handlePaymentSuccess({
          paymentOrderId,
          pspTxnId: order.orderDetail.txnId,
          paymentMethod: order.paymentInstrument?.paymentMode || 'UNKNOWN',
          bankTxnId: order.paymentInstrument?.card?.bank,
          cardType: order.paymentInstrument?.card?.cardType,
          cardNumber: order.paymentInstrument?.card?.cardToken,
          pspRawResponse: order,
        });

        return {
          status: PaymentStatus.SUCCESS,
          details: order,
        };
      } else if (order.txnStatus === '1') {
        await this.handlePaymentFailure({
          paymentOrderId,
          failureReason: order.responseDescription || 'Payment failed',
          pspResponseCode: order.responseCode,
          pspResponseMessage: order.responseDescription,
          pspRawResponse: order,
        });

        return {
          status: PaymentStatus.FAILED,
          details: order,
        };
      } else if (order.txnStatus === '2') {
        await this.handlePaymentPending({
          paymentOrderId,
          pspResponseMessage: order.responseDescription,
        });

        return {
          status: PaymentStatus.PENDING,
          details: order,
        };
      }
    }

    return {
      status: paymentOrder.paymentOrderStatus,
      details: paymentOrder,
    };
  }
}
