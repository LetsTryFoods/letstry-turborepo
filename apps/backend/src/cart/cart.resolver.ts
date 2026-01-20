import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from './cart.schema';
import { AddToCartInput, UpdateCartItemInput, SetShippingAddressInput } from './cart.input';
import { Public } from '../common/decorators/public.decorator';
import { DualAuthGuard } from '../authentication/common/dual-auth.guard';
import { OptionalUser } from '../common/decorators/optional-user.decorator';
import { UserAgent } from '../common/decorators/user-agent.decorator';

@Resolver(() => Cart)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Query(() => Cart, { name: 'myCart', nullable: true })
  @Public()
  @UseGuards(DualAuthGuard)
  async getMyCart(@OptionalUser() user: any): Promise<Cart | null> {
    if (!user?._id) return null;
    return this.cartService.getCart(user._id);
  }

  @Mutation(() => Cart, { name: 'addToCart' })
  @Public()
  @UseGuards(DualAuthGuard)
  async addToCart(
    @Args('input') input: AddToCartInput,
    @OptionalUser() user: any,
  ): Promise<Cart> {
    if (!user?._id) {
      throw new Error('User identification required');
    }
    return this.cartService.addToCart(user._id, input);
  }

  @Mutation(() => Cart, { name: 'updateCartItem' })
  @Public()
  @UseGuards(DualAuthGuard)
  async updateCartItem(
    @Args('input') input: UpdateCartItemInput,
    @OptionalUser() user: any,
  ): Promise<Cart> {
    if (!user?._id) {
      throw new Error('User identification required');
    }
    return this.cartService.updateCartItem(user._id, input);
  }

  @Mutation(() => Cart, { name: 'removeFromCart' })
  @Public()
  @UseGuards(DualAuthGuard)
  async removeFromCart(
    @Args('productId', { type: () => ID }) productId: string,
    @OptionalUser() user: any,
  ): Promise<Cart> {
    if (!user?._id) {
      throw new Error('User identification required');
    }
    return this.cartService.removeFromCart(user._id, productId);
  }

  @Mutation(() => Cart, { name: 'clearCart' })
  @Public()
  @UseGuards(DualAuthGuard)
  async clearCart(@OptionalUser() user: any): Promise<Cart> {
    if (!user?._id) {
      throw new Error('User identification required');
    }
    return this.cartService.clearCart(user._id);
  }

  @Mutation(() => Cart, { name: 'applyCoupon' })
  @Public()
  @UseGuards(DualAuthGuard)
  async applyCoupon(
    @Args('code') code: string,
    @OptionalUser() user: any,
    @UserAgent() userAgent: string,
  ): Promise<Cart> {
    if (!user?._id) {
      throw new Error('User identification required');
    }
    return this.cartService.applyCoupon(user._id, code, userAgent);
  }

  @Mutation(() => Cart, { name: 'removeCoupon' })
  @Public()
  @UseGuards(DualAuthGuard)
  async removeCoupon(@OptionalUser() user: any): Promise<Cart> {
    if (!user?._id) {
      throw new Error('User identification required');
    }
    return this.cartService.removeCoupon(user._id);
  }

  @Mutation(() => Cart, { name: 'setShippingAddress' })
  @Public()
  @UseGuards(DualAuthGuard)
  async setShippingAddress(
    @Args('input') input: SetShippingAddressInput,
    @OptionalUser() user: any,
  ): Promise<Cart> {
    if (!user?._id) {
      throw new Error('User identification required');
    }
    return this.cartService.setShippingAddress(user._id, input.addressId);
  }
}
