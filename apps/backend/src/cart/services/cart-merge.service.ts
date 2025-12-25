import { Injectable } from '@nestjs/common';
import { CartDocument } from '../cart.schema';
import { WinstonLoggerService } from '../../logger/logger.service';
import { CartRepositoryService } from './cart-repository.service';
import { CartItemService } from './cart-item.service';
import { CartCalculationService } from './cart-calculation.service';

@Injectable()
export class CartMergeService {
    constructor(
        private readonly cartRepositoryService: CartRepositoryService,
        private readonly cartItemService: CartItemService,
        private readonly cartCalculationService: CartCalculationService,
        private readonly logger: WinstonLoggerService,
    ) { }

    async mergeCarts(guestIdentityId: string, userIdentityId: string): Promise<void> {
        this.logger.log('Merging carts', { guestIdentityId, userIdentityId }, 'CartModule');

        const guestCart = await this.cartRepositoryService.getCart(guestIdentityId);

        if (!guestCart) {
            this.logger.log('No guest cart to merge', { guestIdentityId }, 'CartModule');
            return;
        }

        if (guestCart.items.length === 0) {
            this.logger.log(
                'Guest cart is empty, marking as merged',
                { guestIdentityId },
                'CartModule',
            );
            await this.cartRepositoryService.markCartAsMerged(guestCart._id);
            return;
        }

        const userCart = await this.cartRepositoryService.getCart(userIdentityId);

        if (!userCart) {
            await this.adoptGuestCartAsUserCart(guestCart, userIdentityId);
            return;
        }

        await this.mergeGuestItemsIntoUserCart(guestCart, userCart);
        await this.cartRepositoryService.markCartAsMerged(guestCart._id);

        this.logger.log('Carts merged successfully', { userIdentityId }, 'CartModule');
    }

    async adoptGuestCartAsUserCart(
        guestCart: CartDocument,
        userIdentityId: string,
    ): Promise<void> {
        this.logger.log(
            'No existing user cart, adopting guest cart',
            { userIdentityId, guestCartId: guestCart._id },
            'CartModule',
        );

        const updated = await this.cartRepositoryService.adoptGuestCartAsUserCart(
            guestCart._id,
            userIdentityId,
        );

        if (!updated) {
            this.logger.warn(
                'Guest cart already merged by another process',
                { guestCartId: guestCart._id },
                'CartModule',
            );
        }
    }

    async mergeGuestItemsIntoUserCart(
        guestCart: CartDocument,
        userCart: CartDocument,
    ): Promise<void> {
        this.logger.log(
            'Merging guest items into user cart',
            {
                guestCartId: guestCart._id,
                userCartId: userCart._id,
            },
            'CartModule',
        );

        for (const guestItem of guestCart.items) {
            this.cartItemService.upsertCartItem(userCart.items, guestItem);
        }

        await this.saveAndRecalculateCart(userCart);
    }

    async saveAndRecalculateCart(cart: CartDocument): Promise<CartDocument> {
        await this.cartCalculationService.recalculateCart(cart);
        return this.cartRepositoryService.saveCart(cart);
    }
}
