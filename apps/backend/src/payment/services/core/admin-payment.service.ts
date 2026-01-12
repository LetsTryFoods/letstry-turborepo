import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaymentOrder, PaymentRefund } from '../../entities/payment.schema';
import {
  GetPaymentsListInput,
  InitiateAdminRefundInput,
} from '../../dto/admin-payment.input';
import { RefundService } from './refund.service';

@Injectable()
export class AdminPaymentService {
  constructor(
    @InjectModel(PaymentOrder.name)
    private paymentOrderModel: Model<PaymentOrder>,
    @InjectModel(PaymentRefund.name)
    private paymentRefundModel: Model<PaymentRefund>,
    private readonly refundService: RefundService,
  ) {}

  async getPaymentsList(input: GetPaymentsListInput) {
    const { page, limit, filters } = input;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters?.statuses?.length) {
      query.paymentOrderStatus = { $in: filters.statuses };
    }

    if (filters?.paymentMethods?.length) {
      query.paymentMethod = { $in: filters.paymentMethods };
    }

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    if (filters?.minAmount || filters?.maxAmount) {
      const minAmount = filters.minAmount
        ? parseFloat(filters.minAmount)
        : null;
      const maxAmount = filters.maxAmount
        ? parseFloat(filters.maxAmount)
        : null;

      if (minAmount !== null || maxAmount !== null) {
        query.$expr = {};
        if (minAmount !== null && maxAmount !== null) {
          query.$expr = {
            $and: [
              { $gte: [{ $toDouble: '$amount' }, minAmount] },
              { $lte: [{ $toDouble: '$amount' }, maxAmount] },
            ],
          };
        } else if (minAmount !== null) {
          query.$expr = { $gte: [{ $toDouble: '$amount' }, minAmount] };
        } else if (maxAmount !== null) {
          query.$expr = { $lte: [{ $toDouble: '$amount' }, maxAmount] };
        }
      }
    }

    if (filters?.identityId) {
      query.identityId = filters.identityId;
    }

    if (filters?.orderId) {
      query.orderId = filters.orderId;
    }

    if (filters?.searchQuery) {
      query.$or = [
        { paymentOrderId: { $regex: filters.searchQuery, $options: 'i' } },
        { pspTxnId: { $regex: filters.searchQuery, $options: 'i' } },
      ];
    }

    const [payments, total] = await Promise.all([
      this.paymentOrderModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.paymentOrderModel.countDocuments(query).exec(),
    ]);

    const allPayments = await this.paymentOrderModel.find(query).lean().exec();
    
    const summary = {
      totalPayments: total,
      totalAmount: allPayments
        .filter((p) => p.paymentOrderStatus === 'SUCCESS')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0)
        .toFixed(2),
      totalRefunded: '0',
      successCount: allPayments.filter((p) => p.paymentOrderStatus === 'SUCCESS').length,
      failedCount: allPayments.filter((p) => p.paymentOrderStatus === 'FAILED').length,
      pendingCount: allPayments.filter((p) => p.paymentOrderStatus === 'PENDING').length,
    };

    const refunds = await this.paymentRefundModel
      .find({
        paymentOrderId: { $in: allPayments.map((p) => p._id) },
        refundStatus: 'SUCCESS',
      })
      .lean()
      .exec();

    summary.totalRefunded = refunds
      .reduce((sum, r) => sum + parseFloat(r.refundAmount), 0)
      .toFixed(2);

    return {
      payments: payments.map((p) => ({
        ...p,
        _id: p._id?.toString(),
        identityId: p.identityId?.toString(),
        orderId: p.orderId?.toString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      summary,
    };
  }

  async getPaymentDetail(paymentOrderId: string) {
    const payment = await this.paymentOrderModel
      .findOne({ paymentOrderId })
      .lean()
      .exec();

    if (!payment) {
      throw new Error('Payment not found');
    }

    const refunds = await this.paymentRefundModel
      .find({ paymentOrderId: payment._id })
      .lean()
      .exec();

    return {
      ...payment,
      _id: payment._id?.toString(),
      identityId: payment.identityId?.toString(),
      orderId: payment.orderId?.toString(),
      paymentEventId: payment.paymentEventId?.toString(),
      refunds: refunds.map((r) => ({
        ...r,
        _id: r._id?.toString(),
        paymentOrderId: r.paymentOrderId?.toString(),
      })),
    };
  }

  async initiateAdminRefund(adminId: string, input: InitiateAdminRefundInput) {
    const payment = await this.paymentOrderModel.findOne({
      paymentOrderId: input.paymentOrderId,
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    const refundAmount = parseFloat(input.refundAmount);
    const paymentAmount = parseFloat(payment.amount);

    if (refundAmount > paymentAmount) {
      throw new Error('Refund amount exceeds payment amount');
    }

    const existingRefunds = await this.paymentRefundModel.find({
      paymentOrderId: payment._id,
    });

    const totalRefunded = existingRefunds.reduce(
      (sum, r) => sum + parseFloat(r.refundAmount),
      0,
    );

    if (totalRefunded + refundAmount > paymentAmount) {
      throw new Error('Total refund amount exceeds payment amount');
    }

    const isPartialRefund = refundAmount < paymentAmount - totalRefunded;

    const refund = await this.refundService.initiateRefund({
      paymentOrderId: input.paymentOrderId,
      refundAmount: input.refundAmount,
      reason: input.reason || `Admin refund by ${adminId}`,
      isPartialRefund,
    });

    return {
      success: true,
      refundId: refund.refundId,
      message: 'Refund initiated successfully',
    };
  }

  async getPaymentsByIdentity(identityId: string) {
    const payments = await this.paymentOrderModel
      .find({ identityId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return payments.map((p) => ({
      ...p,
      _id: p._id.toString(),
      identityId: p.identityId.toString(),
      orderId: p.orderId?.toString(),
    }));
  }

  async getPaymentsByOrder(orderId: string) {
    const payments = await this.paymentOrderModel
      .find({ orderId: new Types.ObjectId(orderId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return payments.map((p) => ({
      ...p,
      _id: p._id.toString(),
      identityId: p.identityId.toString(),
      orderId: p.orderId?.toString(),
    }));
  }
}
