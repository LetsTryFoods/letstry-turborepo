import { InputType, Field } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CancelShipmentInput {
  @Field()
  @IsString()
  awbNumber: string;
}
