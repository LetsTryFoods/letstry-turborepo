import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductService } from '../../product/product.service';
import { WinstonLoggerService } from '../../logger/logger.service';

@Injectable()
export class ProductValidationService {
    constructor(
        private readonly productService: ProductService,
        private readonly logger: WinstonLoggerService,
    ) { }

    async findProduct(productId: string) {
        try {
            return await this.productService.findOne(productId);
        } catch (error) {
            try {
                const product = await this.productService.findByVariantId(productId);
                this.logger.log('Found product by variant ID', { variantId: productId, productId: product._id }, 'CartModule');
                return product;
            } catch (variantError) {
                this.logger.error('Product not found (tried both product ID and variant ID)', { productId }, 'CartModule');
                throw new NotFoundException('Product not found');
            }
        }
    }

    validateProductStatus(product: any, productId: string): void {
        if (product.isArchived) {
            this.logger.error('Product is archived', { productId }, 'CartModule');
            throw new BadRequestException('Product is not available for purchase');
        }
    }

    async validateProductAvailability(productId: string) {
        const product = await this.findProduct(productId);
        this.validateProductStatus(product, productId);
        const variantId = await this.validateVariantAvailability(product, productId);
        return { product, variantId };
    }

    async validateVariantAvailability(product: any, originalProductId: string): Promise<string> {
        const isVariantId = await this.isVariantId(originalProductId, product);

        if (isVariantId) {
            await this.validateSpecificVariant(product, originalProductId);
            return originalProductId;
        } else {
            const defaultVariant = this.getDefaultVariant(product);
            this.validateProductHasAvailableVariants(product, originalProductId);
            return defaultVariant._id.toString();
        }
    }

    async isVariantId(productId: string, product: any): Promise<boolean> {
        return product.variants.some((variant: any) => variant._id.toString() === productId);
    }

    async validateSpecificVariant(product: any, variantId: string): Promise<void> {
        const variant = product.variants.find((v: any) => v._id.toString() === variantId);
        if (!variant) {
            throw new NotFoundException('Product variant not found');
        }
        if (variant.availabilityStatus !== 'in_stock') {
            this.logger.error('Product variant is out of stock', { productId: product._id, variantId, status: variant.availabilityStatus }, 'CartModule');
            throw new BadRequestException('Product variant is currently out of stock');
        }
    }

    validateProductHasAvailableVariants(product: any, productId: string): void {
        const hasAvailableVariant = product.variants.some((v: any) => v.availabilityStatus === 'in_stock' && v.isActive);
        if (!hasAvailableVariant) {
            this.logger.error('No available variants for product', { productId }, 'CartModule');
            throw new BadRequestException('Product is currently out of stock');
        }
    }

    getDefaultVariant(product: any): any {
        const defaultVariant = product.variants.find((v: any) => v.isDefault && v.isActive && v.availabilityStatus === 'in_stock');
        if (defaultVariant) {
            return defaultVariant;
        }
        const firstAvailableVariant = product.variants.find((v: any) => v.isActive && v.availabilityStatus === 'in_stock');
        if (firstAvailableVariant) {
            return firstAvailableVariant;
        }
        throw new BadRequestException('No available variant found for product');
    }

    isProductValid(product: any): boolean {
        return (
            product &&
            !product.isArchived &&
            product.availabilityStatus === 'in_stock'
        );
    }

    getInvalidProductReason(product: any): string {
        if (!product) return 'not_found';
        if (product.isArchived) return 'archived';
        return 'out_of_stock';
    }
}
