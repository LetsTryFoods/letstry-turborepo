import { IsString, IsNotEmpty, IsNumber, IsObject } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateBoxSizeInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  code: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsObject()
  internalDimensions: { l: number; w: number; h: number };

  @Field()
  @IsNumber()
  maxWeight: number;

  @Field()
  @IsNumber()
  cost: number;
}
