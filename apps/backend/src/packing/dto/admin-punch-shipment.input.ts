import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class AdminPunchShipmentInput {
    @Field(() => ID)
    @IsNotEmpty()
    @IsString()
    orderId: string;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    serviceType?: string;
}
