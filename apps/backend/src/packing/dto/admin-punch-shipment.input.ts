import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class AdminPunchShipmentInput {
    @Field(() => ID)
    @IsNotEmpty()
    @IsString()
    orderId: string;
}
