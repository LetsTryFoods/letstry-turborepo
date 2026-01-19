import { Injectable } from '@nestjs/common';
import { CartDocument, CartItem } from '../cart.schema';
import { ProductValidationService } from './product-validation.service';
import { CartCalculationService } from './cart-calculation.service';
import { WinstonLoggerService } from '../../logger/logger.service';

@Injectable()
export class CartHydrationService {
    constructor(
        private readonly productValidationService: ProductValidationService,
        private readonly cartCalculationService: CartCalculationService,
        private readonly logger: WinstonLoggerService,
    ) { }

    async hydrate(cart: CartDocument): Promise<CartDocument> {
        if (!cart || cart.items.length === 0) {
            return cart;
        }

        this.logger.log('Hydrating cart', { cartId: cart._id }, 'CartModule');

        const hydratedItems: CartItem[] = [];

        for (const item of cart.items) {
            try {
                const product = await this.productValidationService.findProduct(
                    item.productId,
                );

                if (!product) {
                    this.logger.warn(
                        'Product not found during hydration, skipping item',
                        { productId: item.productId },
                        'CartModule',
                    );
                    continue;
                }

                const variant = product.variants?.find(
                    (v: any) => v._id.toString() === item.productId,
                ) || this.productValidationService.getDefaultVariant(product);

                // Update item with latest product/variant details
                item.name = `${product.name} - ${variant.name}`;
                item.unitPrice = variant.price;
                item.mrp = variant.mrp;
                item.imageUrl = variant.images?.[0]?.url || product.variants?.[0]?.images?.[0]?.url;
                item.totalPrice = item.unitPrice * item.quantity;
                item.sku = variant.sku;

                hydratedItems.push(item);
            } catch (error) {
                this.logger.error(
                    'Error hydrating cart item',
                    { productId: item.productId, error: error.message },
                    'CartModule',
                );
            }
        }

        cart.items = hydratedItems;
        await this.cartCalculationService.recalculateCart(cart);

        return cart;
    }
}
