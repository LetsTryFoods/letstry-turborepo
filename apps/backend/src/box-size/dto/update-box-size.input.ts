import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { DimensionsInput } from './create-box-size.input';

@InputType()
export class UpdateBoxSizeInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  code?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => DimensionsInput, { nullable: true })
  @IsOptional()
  internalDimensions?: DimensionsInput;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  maxWeight?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  cost?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isActive?: boolean;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  lengthInches?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  breadthInches?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  heightInches?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  lengthCm?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  breadthCm?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  heightCm?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  photos?: string[];
}
