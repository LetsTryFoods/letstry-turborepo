import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class BatchScanItem {
    @Field()
    @IsString()
    @IsNotEmpty()
    ean: string;
}

@InputType()
export class BatchScanInput {
    @Field()
    @IsString()
    @IsNotEmpty()
    packingOrderId: string;

    @Field(() => [BatchScanItem])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BatchScanItem)
    items: BatchScanItem[];
}
