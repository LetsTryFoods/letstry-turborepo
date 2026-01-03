import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { DimensionsInput } from './create-box-size.input';

@InputType()
export class UpdateBoxSizeInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => DimensionsInput, { nullable: true })
  @IsObject()
  @IsOptional()
  internalDimensions?: DimensionsInput;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  maxWeight?: number;

  @Field({ nullable: true })
  @IsNumber()
  @IsOptional()
  cost?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
