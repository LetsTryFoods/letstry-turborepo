import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from './cart.schema';
import { Identity, IdentitySchema } from '../common/schemas/identity.schema';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { ProductModule } from '../product/product.module';
import { LoggerModule } from '../logger/logger.module';
import { CouponModule } from '../coupon/coupon.module';
import { ChargesModule } from '../charges/charges.module';
import { CartRepositoryService } from './services/cart-repository.service';
import { CartItemService } from './services/cart-item.service';
import { CartCalculationService } from './services/cart-calculation.service';
import { CartDiscountService } from './services/cart-discount.service';
import { ProductValidationService } from './services/product-validation.service';
import { CartMergeService } from './services/cart-merge.service';
import { CartValidationService } from './services/cart-validation.service';
import { CartHydrationService } from './services/cart-hydration.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Identity.name, schema: IdentitySchema },
    ]),
    ProductModule,
    LoggerModule,
    CouponModule,
    ChargesModule,
  ],
  providers: [
    CartService,
    CartResolver,
    CartRepositoryService,
    CartItemService,
    CartCalculationService,
    CartDiscountService,
    ProductValidationService,
    CartMergeService,
    CartValidationService,
    CartHydrationService,
  ],
  exports: [CartService],
})
export class CartModule { }
