import { IsString, IsNotEmpty } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ScanItemInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  packingOrderId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  ean: string;
}
