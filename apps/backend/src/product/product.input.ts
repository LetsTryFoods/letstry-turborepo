import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { ProductSeoInput } from './product-seo.input';
import {
  ProductNutritionInput,
  LifestyleImageInput,
  ProductFaqEntryInput,
  ProductHighlightInput,
  ProductCertificationInput,
} from './product-content.input';

@InputType()
export class ProductImageInput {
  @Field()
  url: string;

  @Field()
  alt: string;
}

@InputType()
export class CreateProductVariantInput {
  @Field()
  sku: string;

  @Field()
  name: string;

  @Field(() => Float)
  price: number;

  @Field(() => Float)
  mrp: number;

  @Field(() => Float)
  discountPercent: number;

  @Field({ defaultValue: 'product' })
  discountSource: string;

  @Field(() => Float)
  weight: number;

  @Field({ defaultValue: 'g' })
  weightUnit: string;

  @Field()
  packageSize: string;

  @Field(() => Float)
  length: number;

  @Field(() => Float)
  height: number;

  @Field(() => Float)
  breadth: number;

  @Field(() => Int, { defaultValue: 0 })
  stockQuantity: number;

  @Field({ defaultValue: 'in_stock' })
  availabilityStatus: string;

  @Field(() => [ProductImageInput])
  images: ProductImageInput[];

  @Field()
  thumbnailUrl: string;

  @Field({ defaultValue: false })
  isDefault: boolean;

  @Field({ defaultValue: true })
  isActive: boolean;
}

@InputType()
export class UpdateProductVariantInput {
  @Field({ nullable: true })
  _id?: string;

  @Field({ nullable: true })
  sku?: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field(() => Float, { nullable: true })
  mrp?: number;

  @Field(() => Float, { nullable: true })
  discountPercent?: number;

  @Field({ nullable: true })
  discountSource?: string;

  @Field(() => Float, { nullable: true })
  weight?: number;

  @Field({ nullable: true })
  weightUnit?: string;

  @Field({ nullable: true })
  packageSize?: string;

  @Field(() => Float, { nullable: true })
  length?: number;

  @Field(() => Float, { nullable: true })
  height?: number;

  @Field(() => Float, { nullable: true })
  breadth?: number;

  @Field(() => Int, { nullable: true })
  stockQuantity?: number;

  @Field({ nullable: true })
  availabilityStatus?: string;

  @Field(() => [ProductImageInput], { nullable: true })
  images?: ProductImageInput[];

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field({ nullable: true })
  isDefault?: boolean;

  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class CreateProductInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  favourite?: boolean;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String])
  categoryIds: string[];

  @Field()
  brand: string;

  @Field({ nullable: true })
  gtin?: string;

  @Field({ nullable: true })
  mpn?: string;

  @Field({ nullable: true, defaultValue: 'INR' })
  currency?: string;

  @Field()
  ingredients: string;

  @Field({ nullable: true })
  allergens?: string;

  @Field()
  shelfLife: string;

  @Field({ nullable: true, defaultValue: true })
  isVegetarian?: boolean;

  @Field({ nullable: true, defaultValue: false })
  isGlutenFree?: boolean;

  @Field(() => Float, { nullable: true })
  rating?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  ratingCount?: number;

  @Field(() => [String], { nullable: true })
  keywords?: string[];

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => [CreateProductVariantInput])
  variants: CreateProductVariantInput[];

  // ---- Sprint 4 rich content fields ----------------------------------------
  @Field({ nullable: true }) longDescription?: string;
  @Field({ nullable: true }) healthBenefits?: string;
  @Field({ nullable: true }) servingSuggestions?: string;
  @Field({ nullable: true }) storageInstructions?: string;
  @Field({ nullable: true }) originStory?: string;
  @Field({ nullable: true }) manufacturingProcess?: string;
  @Field(() => [String], { nullable: true }) audience?: string[];
  @Field(() => [String], { nullable: true }) occasions?: string[];
  @Field(() => [ProductHighlightInput], { nullable: true })
  pros?: ProductHighlightInput[];
  @Field(() => [ProductHighlightInput], { nullable: true })
  cons?: ProductHighlightInput[];
  @Field(() => [ProductCertificationInput], { nullable: true })
  certifications?: ProductCertificationInput[];
  @Field(() => [LifestyleImageInput], { nullable: true })
  lifestyleImages?: LifestyleImageInput[];
  @Field({ nullable: true }) videoUrl?: string;
  @Field({ nullable: true }) videoTitle?: string;
  @Field({ nullable: true }) videoDescription?: string;
  @Field({ nullable: true }) videoThumbnailUrl?: string;
  @Field(() => [ProductFaqEntryInput], { nullable: true })
  productFaqs?: ProductFaqEntryInput[];
  @Field(() => [String], { nullable: true }) pillarSlugs?: string[];
  @Field(() => [String], { nullable: true }) relatedProductIds?: string[];
  @Field(() => [String], { nullable: true }) bundleProductIds?: string[];
  @Field(() => ProductNutritionInput, { nullable: true })
  nutrition?: ProductNutritionInput;
  @Field({ nullable: true }) fssaiLicense?: string;
  @Field({ nullable: true }) countryOfOrigin?: string;
  @Field({ nullable: true }) deliveryLeadTime?: string;

  @Field(() => ProductSeoInput, { nullable: true })
  seo?: ProductSeoInput;
}

@InputType()
export class UpdateProductInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  categoryIds?: string[];

  @Field({ nullable: true })
  favourite?: boolean;

  @Field({ nullable: true })
  brand?: string;

  @Field({ nullable: true })
  gtin?: string;

  @Field({ nullable: true })
  mpn?: string;

  @Field({ nullable: true })
  currency?: string;

  @Field({ nullable: true })
  ingredients?: string;

  @Field({ nullable: true })
  allergens?: string;

  @Field({ nullable: true })
  shelfLife?: string;

  @Field({ nullable: true })
  isVegetarian?: boolean;

  @Field({ nullable: true })
  isGlutenFree?: boolean;

  @Field(() => Float, { nullable: true })
  rating?: number;

  @Field(() => Int, { nullable: true })
  ratingCount?: number;

  @Field(() => [String], { nullable: true })
  keywords?: string[];

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => [UpdateProductVariantInput], { nullable: true })
  variants?: UpdateProductVariantInput[];

  // ---- Sprint 4 rich content fields (all optional on update) --------------
  @Field({ nullable: true }) longDescription?: string;
  @Field({ nullable: true }) healthBenefits?: string;
  @Field({ nullable: true }) servingSuggestions?: string;
  @Field({ nullable: true }) storageInstructions?: string;
  @Field({ nullable: true }) originStory?: string;
  @Field({ nullable: true }) manufacturingProcess?: string;
  @Field(() => [String], { nullable: true }) audience?: string[];
  @Field(() => [String], { nullable: true }) occasions?: string[];
  @Field(() => [ProductHighlightInput], { nullable: true })
  pros?: ProductHighlightInput[];
  @Field(() => [ProductHighlightInput], { nullable: true })
  cons?: ProductHighlightInput[];
  @Field(() => [ProductCertificationInput], { nullable: true })
  certifications?: ProductCertificationInput[];
  @Field(() => [LifestyleImageInput], { nullable: true })
  lifestyleImages?: LifestyleImageInput[];
  @Field({ nullable: true }) videoUrl?: string;
  @Field({ nullable: true }) videoTitle?: string;
  @Field({ nullable: true }) videoDescription?: string;
  @Field({ nullable: true }) videoThumbnailUrl?: string;
  @Field(() => [ProductFaqEntryInput], { nullable: true })
  productFaqs?: ProductFaqEntryInput[];
  @Field(() => [String], { nullable: true }) pillarSlugs?: string[];
  @Field(() => [String], { nullable: true }) relatedProductIds?: string[];
  @Field(() => [String], { nullable: true }) bundleProductIds?: string[];
  @Field(() => ProductNutritionInput, { nullable: true })
  nutrition?: ProductNutritionInput;
  @Field({ nullable: true }) fssaiLicense?: string;
  @Field({ nullable: true }) countryOfOrigin?: string;
  @Field({ nullable: true }) deliveryLeadTime?: string;

  @Field(() => ProductSeoInput, { nullable: true })
  seo?: ProductSeoInput;
}
