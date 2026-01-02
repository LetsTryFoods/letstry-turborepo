import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateBoxSizeInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsObject()
  @IsOptional()
  internalDimensions?: { l: number; w: number; h: number };

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
