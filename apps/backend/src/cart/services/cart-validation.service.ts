import { Injectable } from '@nestjs/common';
import { CartDocument, CartItem } from '../cart.schema';
import { WinstonLoggerService } from '../../logger/logger.service';
import { CartRepositoryService } from './cart-repository.service';
import { CartItemService } from './cart-item.service';
import { CartCalculationService } from './cart-calculation.service';
import { ProductValidationService } from './product-validation.service';

@Injectable()
export class CartValidationService {
    constructor(
        private readonly cartRepositoryService: CartRepositoryService,
        private readonly cartItemService: CartItemService,
        private readonly cartCalculationService: CartCalculationService,
        private readonly productValidationService: ProductValidationService,
        private readonly logger: WinstonLoggerService,
    ) { }

    async validateAndCleanCart(identityId: string): Promise<CartDocument | null> {
        const cart = await this.cartRepositoryService.getCart(identityId);
        if (!cart || cart.items.length === 0) {
            return cart;
        }

        const validItems: CartItem[] = [];
        const removedItems: string[] = [];

        for (const item of cart.items) {
            const { valid, product } = await this.validateCartItem(item);

            if (!valid) {
                removedItems.push(item.name);
                continue;
            }

            const priceUpdated = this.cartItemService.updateCartItemPrice(item, product);
            if (priceUpdated) {
                this.logger.log(
                    'Updated product price in cart',
                    {
                        productId: item.productId,
                        newPrice: product.price,
                    },
                    'CartModule',
                );
            }
            validItems.push(item);
        }

        if (removedItems.length > 0) {
            cart.items = validItems;
            await this.saveAndRecalculateCart(cart);

            this.logger.log(
                'Cart cleaned',
                {
                    removedCount: removedItems.length,
                    removedItems,
                },
                'CartModule',
            );
        }

        return cart;
    }

    async validateCartItem(
        item: CartItem,
    ): Promise<{ valid: boolean; product?: any }> {
        try {
            const product = await this.productValidationService.findProduct(item.productId);

            if (!this.productValidationService.isProductValid(product)) {
                this.logger.warn(
                    'Removing invalid item from cart',
                    {
                        productId: item.productId,
                        reason: this.productValidationService.getInvalidProductReason(product),
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
