import { Injectable } from '@nestjs/common';
import { CartDocument, CartItem } from '../cart.schema';
import { WinstonLoggerService } from '../../logger/logger.service';
import { CartRepositoryService } from './cart-repository.service';
import { CartItemService } from './cart-item.service';
import { CartCalculationService } from './cart-calculation.service';
import { ProductValidationService } from './product-validation.service';
import { CartHydrationService } from './cart-hydration.service';

@Injectable()
export class CartValidationService {
  constructor(
    private readonly cartRepositoryService: CartRepositoryService,
    private readonly cartItemService: CartItemService,
    private readonly cartCalculationService: CartCalculationService,
    private readonly productValidationService: ProductValidationService,
    private readonly cartHydrationService: CartHydrationService,
    private readonly logger: WinstonLoggerService,
  ) { }

  async validateAndCleanCart(identityId: string): Promise<CartDocument | null> {
    const cart = await this.cartRepositoryService.getCart(identityId);
    if (!cart) return null;
    return this.cartHydrationService.hydrate(cart);
  }

  async validateCartItem(
    item: CartItem,
  ): Promise<{ valid: boolean; product?: any }> {
    try {
      const product = await this.productValidationService.findProduct(
        item.productId,
      );

      if (!this.productValidationService.isProductValid(product)) {
        this.logger.warn(
          'Removing invalid item from cart',
          {
            productId: item.productId,
            reason:
              this.productValidationService.getInvalidProductReason(product),
          },
          'CartModule',
        );
        return { valid: false };
      }

      return { valid: true, product };
    } catch (error) {
      this.logger.error(
        'Error validating cart item',
        {
          productId: item.productId,
          error: error.message,
        },
        'CartModule',
      );
      return { valid: false };
    }
  }

  async saveAndRecalculateCart(cart: CartDocument): Promise<CartDocument> {
    await this.cartCalculationService.recalculateCart(cart);
    return this.cartRepositoryService.saveCart(cart);
  }
}
