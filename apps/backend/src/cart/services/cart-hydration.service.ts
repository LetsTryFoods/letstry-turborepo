import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartDocument, CartItem } from '../cart.schema';
import { ProductValidationService } from './product-validation.service';
import { CartCalculationService } from './cart-calculation.service';
import { WinstonLoggerService } from '../../logger/logger.service';
import { Address, AddressDocument } from '../../address/address.schema';

@Injectable()
export class CartHydrationService {
    constructor(
        @InjectModel(Address.name) private addressModel: Model<AddressDocument>,
        private readonly productValidationService: ProductValidationService,
        private readonly cartCalculationService: CartCalculationService,
        private readonly logger: WinstonLoggerService,
    ) { }

    async hydrate(cart: CartDocument): Promise<CartDocument> {
        if (!cart) {
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
        
        let shippingAddress: AddressDocument | null = null;
        if (cart.shippingAddressId) {
            try {
                shippingAddress = await this.addressModel.findById(cart.shippingAddressId).exec();
            } catch (error) {
                this.logger.warn(
                    'Error fetching shipping address',
                    { addressId: cart.shippingAddressId, error: error.message },
                    'CartModule',
                );
            }
        }

        await this.cartCalculationService.recalculateCart(cart, shippingAddress ? { pincode: shippingAddress.postalCode } : undefined);

        return cart;
    }
}
