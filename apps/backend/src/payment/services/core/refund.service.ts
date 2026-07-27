import { Injectable, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PaymentRefund,
  PaymentOrder,
  PaymentStatus,
} from '../../entities/payment.schema';
import { Order } from '../../../order/order.schema';
import { Address } from '../../../address/address.schema';
import { ZaakpayGatewayService } from '../../gateways/zaakpay/zaakpay-gateway.service';
import { LedgerService } from './ledger.service';
import { PaymentLoggerService } from '../../../common/services/payment-logger.service';
import { MetaWhatsappService } from '../../../whatsapp/services/meta-whatsapp.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RefundService {
  constructor(
    @InjectModel(PaymentRefund.name)
    private paymentRefundModel: Model<PaymentRefund>,
    @InjectModel(PaymentOrder.name)
    private paymentOrderModel: Model<PaymentOrder>,
    @InjectModel(Order.name)
    private orderModel: Model<Order>,
    @InjectModel(Address.name)
    private addressModel: Model<Address>,
    private zaakpayGateway: ZaakpayGatewayService,
    private ledgerService: LedgerService,
    private paymentLogger: PaymentLoggerService,
    @Optional() private metaWhatsappService?: MetaWhatsappService,
  ) {}

  async initiateRefund(params: {
    paymentOrderId: string;
    refundAmount: string;
    reason: string;
    isPartialRefund: boolean;
  }): Promise<PaymentRefund> {
    const paymentOrder = await this.paymentOrderModel.findOne({
      paymentOrderId: params.paymentOrderId,
    });

    if (!paymentOrder) {
      throw new Error('Payment order not found');
    }

    if (paymentOrder.paymentOrderStatus !== PaymentStatus.SUCCESS) {
      throw new Error('Can only refund successful payments');
    }

    const refundAmount = parseFloat(params.refundAmount);
    const orderAmount = parseFloat(paymentOrder.amount);

    if (refundAmount > orderAmount) {
      throw new Error('Refund amount cannot exceed payment amount');
    }

    const refundId = `REF_${uuidv4()}`;
    const merchantRefId = `MREF${Date.now()}${uuidv4().replace(/-/g, '').substring(0, 8)}`;

    const refund = new this.paymentRefundModel({
      refundId,
      paymentOrderId: params.paymentOrderId,
      refundAmount: params.refundAmount,
      currency: paymentOrder.currency,
      reason: params.reason,
      refundStatus: PaymentStatus.EXECUTING,
    });

    await refund.save();

    this.paymentLogger.logRefundInitiation({
      refundId,
      paymentOrderId: params.paymentOrderId,
      refundAmount: params.refundAmount,
    });

    try {
      // Zaakpay v1 API always requires refundAmount (integer in paisa).
      // Compute isPartialRefund from amounts to ensure correct refundType ('P'/'F').
      const isActualPartial = refundAmount < orderAmount;
      const zaakpayResponse = await this.zaakpayGateway.initiateRefund({
        orderId: params.paymentOrderId,
        amount: params.refundAmount,   // always pass — required by Zaakpay v1
        updateReason: params.reason,
        merchantRefId,
        isPartialRefund: isActualPartial,
      });

      const isSuccess =
        zaakpayResponse?.success === true ||
        zaakpayResponse?.status === true ||
        zaakpayResponse?.message?.code === '100' ||
        zaakpayResponse?.message?.code === 100 ||
        zaakpayResponse?.responseCode === '230' ||
        zaakpayResponse?.responseCode === '245';

      if (isSuccess) {
        const respCode =
          zaakpayResponse?.message?.code?.toString() ||
          zaakpayResponse?.responseCode ||
          '100';
        const respMsg =
          zaakpayResponse?.message?.text ||
          zaakpayResponse?.responseDescription ||
          'Refund Processed';

        await this.paymentRefundModel.findOneAndUpdate(
          { refundId },
          {
            refundStatus: PaymentStatus.SUCCESS,
            zaakpayRefundId: merchantRefId,
            pspResponseCode: respCode,
            pspResponseMessage: respMsg,
            pspRawResponse: zaakpayResponse,
            processedAt: new Date(),
          },
        );

        await this.ledgerService.recordRefundTransaction({
          paymentOrderId: params.paymentOrderId,
          identityId: paymentOrder.identityId.toString(),
          amount: params.refundAmount,
          currency: paymentOrder.currency,
          refundId,
        });

        const newStatus = params.isPartialRefund
          ? PaymentStatus.PARTIALLY_REFUNDED
          : PaymentStatus.REFUNDED;

        await this.paymentOrderModel.findOneAndUpdate(
          { paymentOrderId: params.paymentOrderId },
          { paymentOrderStatus: newStatus },
        );

        // Send WhatsApp Refund Notification
        // Look up phone: PaymentOrder.paymentOrderId → Order.shippingAddressId → Address.recipientPhone
        try {
          if (this.metaWhatsappService) {
            let customerPhone = '';
            let customerName = 'Customer';

            // 1. Find Order by paymentOrderId to get shippingAddressId
            const order = await this.orderModel
              .findOne({ paymentOrderId: params.paymentOrderId })
              .lean();

            if (order?.shippingAddressId) {
              // 2. Find Address to get recipientPhone
              const address = await this.addressModel
                .findById(order.shippingAddressId)
                .lean();

              if (address?.recipientPhone && address.recipientPhone !== 'N/A') {
                customerPhone = address.recipientPhone;
                customerName = address.recipientName || 'Customer';
              }
            }

            if (customerPhone) {
              await this.metaWhatsappService.sendRefundNotification({
                phoneNumber: customerPhone,
                customerName,
                refundAmount: `₹${params.refundAmount}`,
                orderId: params.paymentOrderId,
                refundId: merchantRefId,
                reason: params.reason || 'shortage of item',
              });
            } else {
              this.paymentLogger.error(
                'WhatsApp refund notification skipped — no phone found',
                undefined,
                { paymentOrderId: params.paymentOrderId },
              );
            }
          }
        } catch (err: any) {
          this.paymentLogger.error(
            `WhatsApp refund notification failed: ${err.message}`,
            err.stack,
            { paymentOrderId: params.paymentOrderId },
          );
        }

        this.paymentLogger.logRefundSuccess({
          refundId,
          pspRefundId: merchantRefId,
          amount: params.refundAmount,
          paymentOrderId: params.paymentOrderId,
        });
      } else {
        const respCode =
          zaakpayResponse?.message?.code?.toString() ||
          zaakpayResponse?.responseCode ||
          'UNKNOWN';
        const respMsg =
          zaakpayResponse?.message?.text ||
          zaakpayResponse?.responseDescription ||
          'Refund Failed';

        await this.paymentRefundModel.findOneAndUpdate(
          { refundId },
          {
            refundStatus: PaymentStatus.FAILED,
            pspResponseCode: respCode,
            pspResponseMessage: respMsg,
            pspRawResponse: zaakpayResponse,
            processedAt: new Date(),
          },
        );

        this.paymentLogger.logRefundFailure({
          refundId,
          reason: respMsg,
          pspResponseCode: respCode,
          paymentOrderId: params.paymentOrderId,
        });
      }

      const updatedRefund = await this.paymentRefundModel.findOne({ refundId });
      if (!updatedRefund) {
        throw new Error('Refund not found after update');
      }
      return updatedRefund;
    } catch (error) {
      await this.paymentRefundModel.findOneAndUpdate(
        { refundId },
        {
          refundStatus: PaymentStatus.FAILED,
          pspResponseMessage: error.message,
          processedAt: new Date(),
        },
      );

      this.paymentLogger.logRefundFailure({
        refundId,
        reason: error.message,
      });

      throw error;
    }
  }

  async checkRefundStatus(refundId: string): Promise<PaymentRefund> {
    const refund = await this.paymentRefundModel.findOne({ refundId });

    if (!refund) {
      throw new Error('Refund not found');
    }

    if (
      refund.refundStatus === PaymentStatus.SUCCESS ||
      refund.refundStatus === PaymentStatus.FAILED
    ) {
      return refund;
    }

    const paymentOrder = await this.paymentOrderModel.findOne({
      paymentOrderId: refund.paymentOrderId.toString(),
    });

    if (!paymentOrder) {
      throw new Error('Payment order not found');
    }

    try {
      const zaakpayStatus = await this.zaakpayGateway.checkTransactionStatus({
        orderId: paymentOrder.paymentOrderId,
        merchantRefId: refund.pspRefundId,
      });

      if (zaakpayStatus.success && zaakpayStatus.orders?.length > 0) {
        const order = zaakpayStatus.orders[0];

        if (order.refundDetails && order.refundDetails.length > 0) {
          const refundDetail = order.refundDetails.find(
            (r: any) => r.merchantRefId === refund.pspRefundId,
          );

          if (refundDetail) {
            await this.paymentRefundModel.findOneAndUpdate(
              { refundId },
              {
                refundStatus: PaymentStatus.SUCCESS,
                pspRawResponse: refundDetail,
                processedAt: new Date(),
              },
            );
          }
        }
      }

      const updatedRefund = await this.paymentRefundModel.findOne({ refundId });
      if (!updatedRefund) {
        throw new Error('Refund not found after status check');
      }
      return updatedRefund;
    } catch (error) {
      this.paymentLogger.error('Check refund status failed', error.stack, {
        refundId,
        error: error.message,
      });
      return refund;
    }
  }

  async getRefundsByPaymentOrder(
    paymentOrderId: string,
  ): Promise<PaymentRefund[]> {
    return this.paymentRefundModel.find({ paymentOrderId }).exec();
  }

  async getRefundsByIdentity(identityId: string): Promise<PaymentRefund[]> {
    const paymentOrders = await this.paymentOrderModel
      .find({ identityId })
      .select('paymentOrderId')
      .exec();

    const paymentOrderIds = paymentOrders.map((po) => po.paymentOrderId);

    return this.paymentRefundModel
      .find({ paymentOrderId: { $in: paymentOrderIds } })
      .exec();
  }
}
