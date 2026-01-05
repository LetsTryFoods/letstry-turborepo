import { IsString, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class DimensionsInput {
  @Field(() => Number)
  @IsNumber()
  l: number;

  @Field(() => Number)
  @IsNumber()
  w: number;

  @Field(() => Number)
  @IsNumber()
  h: number;
}

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

  @Field(() => DimensionsInput)
  internalDimensions: DimensionsInput;

  @Field(() => Number)
  @IsNumber()
  maxWeight: number;

  @Field(() => Number)
  @IsNumber()
  cost: number;
}
