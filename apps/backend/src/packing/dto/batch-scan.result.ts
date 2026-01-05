import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class BatchItemResult {
    @Field()
    ean: string;

    @Field()
    isValid: boolean;

    @Field({ nullable: true })
    errorType?: string;

    @Field({ nullable: true })
    itemName?: string;
}

@ObjectType()
export class BatchScanResult {
    @Field(() => Int)
    totalProcessed: number;

    @Field(() => Int)
    successCount: number;

    @Field(() => Int)
    failureCount: number;

    @Field(() => [BatchItemResult])
    results: BatchItemResult[];
}
