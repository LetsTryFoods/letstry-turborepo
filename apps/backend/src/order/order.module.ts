import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './order.schema';
import { Identity, IdentitySchema } from '../common/schemas/identity.schema';
import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';
import { OrderCartLoggerService } from './order-cart-logger.service';
import { ProductModule } from '../product/product.module';
import { OrderRepository } from './services/order.repository';
import { OrderQueryService } from './services/order.query-service';
import { OrderCommandService } from './services/order.command-service';
import { OrderItemService } from './services/order.item-service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Identity.name, schema: IdentitySchema },
    ]),
    ProductModule,
  ],
  providers: [
    OrderService,
    OrderResolver,
    OrderCartLoggerService,
    OrderRepository,
    OrderQueryService,
    OrderCommandService,
    OrderItemService,
  ],
  exports: [OrderService, OrderCartLoggerService],
})
export class OrderModule {}
