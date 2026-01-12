import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PaymentEvent, PaymentEventSchema } from './entities/payment.schema';
import { PaymentOrder, PaymentOrderSchema } from './entities/payment.schema';
import { Ledger, LedgerSchema } from './entities/payment.schema';
import { PaymentRefund, PaymentRefundSchema } from './entities/payment.schema';
import {
  PaymentReconciliation,
  PaymentReconciliationSchema,
} from './entities/payment.schema';
import { Identity, IdentitySchema } from '../common/schemas/identity.schema';
import { PaymentService } from './services/core/payment.service';
import { PaymentResolver } from './payment.resolver';
import { AdminPaymentResolver } from './admin-payment.resolver';
import { PaymentController } from './payment.controller';
import { PaymentExecutorService } from './services/domain/payment-executor.service';
import { ZaakpayChecksumService } from './gateways/zaakpay/zaakpay-checksum.service';
import { ZaakpayHttpService } from './gateways/zaakpay/zaakpay-http.service';
import { ZaakpayPaymentService } from './gateways/zaakpay/zaakpay-payment.service';
import { ZaakpayRefundService } from './gateways/zaakpay/zaakpay-refund.service';
import { ZaakpayStatusService } from './gateways/zaakpay/zaakpay-status.service';
import { ZaakpaySettlementService } from './gateways/zaakpay/zaakpay-settlement.service';
import { ZaakpayGatewayService } from './gateways/zaakpay/zaakpay-gateway.service';
import { LedgerService } from './services/core/ledger.service';
import { RefundService } from './services/core/refund.service';
import { AdminPaymentService } from './services/core/admin-payment.service';
import { PaymentLoggerService } from '../common/services/payment-logger.service';
import { PaymentGatewayFactory } from './gateways/payment-gateway.factory';
import { CartModule } from '../cart/cart.module';
import { WebhookLoggerService } from './services/domain/webhook-logger.service';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    ConfigModule,
    CartModule,
    OrderModule,
    EventEmitterModule.forRoot(),
    MongooseModule.forFeature([
      { name: PaymentEvent.name, schema: PaymentEventSchema },
      { name: PaymentOrder.name, schema: PaymentOrderSchema },
      { name: Ledger.name, schema: LedgerSchema },
      { name: PaymentRefund.name, schema: PaymentRefundSchema },
      { name: PaymentReconciliation.name, schema: PaymentReconciliationSchema },
      { name: Identity.name, schema: IdentitySchema },
    ]),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentResolver,
    AdminPaymentResolver,
    AdminPaymentService,
    PaymentExecutorService,
    ZaakpayChecksumService,
    ZaakpayHttpService,
    ZaakpayPaymentService,
    ZaakpayRefundService,
    ZaakpayStatusService,
    ZaakpaySettlementService,
    ZaakpayGatewayService,
    LedgerService,
    RefundService,
    PaymentLoggerService,
    PaymentGatewayFactory,
    WebhookLoggerService,
  ],
  exports: [PaymentService],
})
export class PaymentModule { }
