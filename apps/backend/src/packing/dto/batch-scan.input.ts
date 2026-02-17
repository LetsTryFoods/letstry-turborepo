import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class ProductScanItem {
    @Field()
    @IsString()
    @IsNotEmpty()
    productId: string;

    @Field(() => [String])
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    eans: string[];
}

@InputType()
export class BatchScanInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    packingOrderId: string;

    @Field(() => [ProductScanItem])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductScanItem)
    items: ProductScanItem[];
}
