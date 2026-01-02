import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Identity, IdentitySchema } from '../common/schemas/identity.schema';
import { Order, OrderSchema } from '../order/order.schema';
import { Cart, CartSchema } from '../cart/cart.schema';
import { AddressModule } from '../address/address.module';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserCrudService } from './services/user-crud.service';
import { CustomerQueryService } from './services/customer-query.service';
import { CustomerStatsService } from './services/customer-stats.service';
import { CustomerEnrichmentService } from './services/customer-enrichment.service';
import { CustomerDetailsService } from './services/customer-details.service';
import { UserActivityService } from './services/user-activity.service';
import { UserMapperService } from './services/user-mapper.service';
import { PaginationService } from './services/pagination.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Identity.name, schema: IdentitySchema },
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema },
    ]),
    AddressModule,
  ],
  providers: [
    UserService,
    UserResolver,
    UserCrudService,
    CustomerQueryService,
    CustomerStatsService,
    CustomerEnrichmentService,
    CustomerDetailsService,
    UserActivityService,
    UserMapperService,
    PaginationService,
  ],
  exports: [UserService],
})
export class UserModule {}
