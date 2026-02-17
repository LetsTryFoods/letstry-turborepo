import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ProductValidation {
    @Field()
    productId: string;

    @Field()
    isValid: boolean;

    @Field({ nullable: true })
    errorType?: string;

    @Field({ nullable: true })
    errorMessage?: string;

    @Field(() => Int, { nullable: true })
    expectedQuantity?: number;

    @Field(() => Int, { nullable: true })
    scannedQuantity?: number;

    @Field({ nullable: true })
    productName?: string;
}

@ObjectType()
export class BatchScanResult {
    @Field()
    success: boolean;

    @Field(() => Int)
    totalProcessed: number;

    @Field(() => Int)
    successCount: number;

    @Field(() => Int)
    failureCount: number;

    @Field(() => [ProductValidation])
    validations: ProductValidation[];

    @Field({ nullable: true })
    errorMessage?: string;

    @Field(() => Int, { nullable: true })
    totalScans?: number;
}
