import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument, CartStatus } from '../cart.schema';

@Injectable()
export class CartRepositoryService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

  async getCart(identityId: string): Promise<CartDocument | null> {
    return this.cartModel
      .findOne({
        identityId,
        status: CartStatus.ACTIVE,
      })
      .exec();
  }

  async getCartOrThrow(identityId: string): Promise<CartDocument> {
    const cart = await this.getCart(identityId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }

  async saveCart(cart: CartDocument): Promise<CartDocument> {
    return cart.save();
  }

  async markCartAsMerged(cartId: string): Promise<void> {
    await this.cartModel.findOneAndUpdate(
      { _id: cartId, status: CartStatus.ACTIVE },
      { status: CartStatus.MERGED },
      { new: true },
    );
  }

  async adoptGuestCartAsUserCart(
    guestCartId: string,
    userIdentityId: string,
  ): Promise<CartDocument | null> {
    return this.cartModel.findOneAndUpdate(
      { _id: guestCartId, status: CartStatus.ACTIVE },
      {
        identityId: userIdentityId,
      },
      { new: true },
    );
  }

  async createCart(identityId: string): Promise<CartDocument> {
    return this.cartModel.create({
      identityId,
      status: CartStatus.ACTIVE,
      items: [],
    });
  }
}
