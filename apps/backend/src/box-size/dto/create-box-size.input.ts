import {
  IsString,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
  IsOptional,
} from 'class-validator';
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

  @Field(() => DimensionsInput, { nullable: true })
  @IsOptional()
  internalDimensions?: DimensionsInput;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  maxWeight?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  cost?: number;

  @Field(() => Number)
  @IsNumber()
  lengthInches: number;

  @Field(() => Number)
  @IsNumber()
  breadthInches: number;

  @Field(() => Number)
  @IsNumber()
  heightInches: number;

  @Field(() => Number)
  @IsNumber()
  lengthCm: number;

  @Field(() => Number)
  @IsNumber()
  breadthCm: number;

  @Field(() => Number)
  @IsNumber()
  heightCm: number;

  @Field(() => [String])
  @IsOptional()
  photos: string[];

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isActive?: boolean;
}
