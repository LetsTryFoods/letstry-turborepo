import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './cart.schema';
import { WinstonLoggerService } from '../logger/logger.service';
import { AddToCartInput, UpdateCartItemInput } from './cart.input';
import { Identity, IdentityDocument } from '../common/schemas/identity.schema';
import { CartRepositoryService } from './services/cart-repository.service';
import { CartItemService } from './services/cart-item.service';
import { CartCalculationService } from './services/cart-calculation.service';
import { CartDiscountService } from './services/cart-discount.service';
import { ProductValidationService } from './services/product-validation.service';
import { CartMergeService } from './services/cart-merge.service';
import { CartValidationService } from './services/cart-validation.service';
import { CartHydrationService } from './services/cart-hydration.service';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Identity.name) private identityModel: Model<IdentityDocument>,
    private readonly cartRepositoryService: CartRepositoryService,
    private readonly cartItemService: CartItemService,
    private readonly cartCalculationService: CartCalculationService,
    private readonly cartDiscountService: CartDiscountService,
    private readonly productValidationService: ProductValidationService,
    private readonly cartMergeService: CartMergeService,
    private readonly cartValidationService: CartValidationService,
    private readonly cartHydrationService: CartHydrationService,
    private readonly logger: WinstonLoggerService,
  ) { }

  async getCart(identityId: string): Promise<CartDocument | null> {
    this.logger.log('Fetching cart', { identityId }, 'CartModule');
    const cart = await this.cartRepositoryService.getCart(identityId);
    if (!cart) return null;
    return this.cartHydrationService.hydrate(cart);
  }

  async getCartById(cartId: string): Promise<CartDocument | null> {
    const cart = await this.cartModel.findOne({ _id: cartId }).exec();
    if (!cart) return null;
    return this.cartHydrationService.hydrate(cart);
  }

  async addToCart(
    identityId: string,
    input: AddToCartInput,
  ): Promise<CartDocument> {
    this.logger.log('Adding to cart', { identityId, input }, 'CartModule');

    const cart = await this.getOrCreateCart(identityId);
    const { product, variantId } =
      await this.productValidationService.validateProductAvailability(
        input.productId,
      );

    const variant = variantId
      ? product.variants.find((v: any) => v._id.toString() === variantId)
      : this.productValidationService.getDefaultVariant(product);

    const newItem = this.cartItemService.createCartItem(
      product,
      input.quantity,
      variant,
      variantId,
      input.attributes,
    );

    this.cartItemService.upsertCartItem(cart.items, newItem);

    const savedCart = await this.saveAndRecalculateCart(cart);
    this.logger.log(
      'Item added to cart',
      { cartId: savedCart._id },
      'CartModule',
    );
    return savedCart;
  }

  async updateCartItem(
    identityId: string,
    input: UpdateCartItemInput,
  ): Promise<CartDocument> {
    this.logger.log('Updating cart item', { identityId, input }, 'CartModule');
    const cart = await this.cartRepositoryService.getCartOrThrow(identityId);

    const itemIndex = this.cartItemService.findItemIndexInCart(
      cart.items,
      input.productId,
    );
    if (itemIndex === -1) {
      throw new NotFoundException('Item not found in cart');
    }

    if (input.quantity === 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      this.cartItemService.updateItemQuantity(
        cart.items[itemIndex],
        input.quantity,
      );
    }

    return this.saveAndRecalculateCart(cart);
  }

  async mergeCarts(
    guestIdentityId: string,
    userIdentityId: string,
  ): Promise<void> {
    return this.cartMergeService.mergeCarts(guestIdentityId, userIdentityId);
  }

  async applyCoupon(identityId: string, code: string, userAgent?: string): Promise<CartDocument> {
    this.logger.log('Applying coupon', { identityId, code }, 'CartModule');
    const cart = await this.cartRepositoryService.getCartOrThrow(identityId);

    await this.cartDiscountService.validateAndApplyCoupon(
      code,
      cart.totalsSummary.subtotal,
      userAgent,
    );
    cart.couponCode = code;
    return this.saveAndRecalculateCart(cart);
  }

  async removeCoupon(identityId: string): Promise<CartDocument> {
    this.logger.log('Removing coupon', { identityId }, 'CartModule');
    const cart = await this.cartRepositoryService.getCartOrThrow(identityId);

    cart.couponCode = undefined;
    return this.saveAndRecalculateCart(cart);
  }

  async removeFromCart(
    identityId: string,
    productId: string,
  ): Promise<CartDocument> {
    this.logger.log(
      'Removing from cart',
      { identityId, productId },
      'CartModule',
    );
    const cart = await this.cartRepositoryService.getCartOrThrow(identityId);

    cart.items = this.cartItemService.removeItemFromCart(cart.items, productId);
    return this.saveAndRecalculateCart(cart);
  }

  async clearCart(identityId: string): Promise<CartDocument> {
    this.logger.log('Clearing cart', { identityId }, 'CartModule');
    const cart = await this.cartRepositoryService.getCartOrThrow(identityId);

    cart.items = [];
    return this.saveAndRecalculateCart(cart);
  }

  async validateAndCleanCart(identityId: string): Promise<CartDocument | null> {
    return this.cartValidationService.validateAndCleanCart(identityId);
  }

  private async getOrCreateCart(identityId: string): Promise<CartDocument> {
    let cart = await this.cartRepositoryService.getCart(identityId);

    if (!cart) {
      this.logger.log(
        'Cart not found, creating new one',
        { identityId },
        'CartModule',
      );
      cart = await this.cartRepositoryService.createCart(identityId);
    }

    return cart;
  }

  private async saveAndRecalculateCart(
    cart: CartDocument,
  ): Promise<CartDocument> {
    await this.cartHydrationService.hydrate(cart);
    return this.cartRepositoryService.saveCart(cart);
  }
}
