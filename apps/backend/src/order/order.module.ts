import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './order.schema';
import { Identity, IdentitySchema } from '../common/schemas/identity.schema';
import { OrderService } from './order.service';
import { OrderResolver, OrderWithUserInfoResolver } from './order.resolver';
import { OrderCartLoggerService } from './order-cart-logger.service';
import { ProductModule } from '../product/product.module';
import { OrderRepository } from './services/order.repository';
import { OrderQueryService } from './services/order.query-service';
import { OrderCommandService } from './services/order.command-service';
import { OrderItemService } from './services/order.item-service';
import { PaymentOrder, PaymentOrderSchema, PaymentEvent, PaymentEventSchema } from '../payment/entities/payment.schema';
import { Address, AddressSchema } from '../address/address.schema'; import { PackingModule } from '../packing/packing.module';
import { OrderController } from './order.controller';
import { InvoiceService } from './services/invoice.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Identity.name, schema: IdentitySchema },
      { name: PaymentOrder.name, schema: PaymentOrderSchema },
      { name: PaymentEvent.name, schema: PaymentEventSchema },
      { name: Address.name, schema: AddressSchema },
    ]),
    ProductModule,
    forwardRef(() => PackingModule),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderResolver,
    OrderWithUserInfoResolver,
    OrderCartLoggerService,
    OrderRepository,
    OrderQueryService,
    OrderCommandService,
    OrderItemService,
    InvoiceService,
  ],
  exports: [OrderService, OrderCartLoggerService, OrderRepository],
})
export class OrderModule { }
