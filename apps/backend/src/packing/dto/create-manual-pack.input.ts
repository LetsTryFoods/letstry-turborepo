import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsInt,
  Min,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class ManualPackItemInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity: number;
}

@InputType()
export class CreateManualPackInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  senderName: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  senderPhone?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  recipientPhone: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  addressLine1: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  city: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  state: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  pincode: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  boxId: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  note?: string;

  @Field(() => [ManualPackItemInput])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ManualPackItemInput)
  items: ManualPackItemInput[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  prePackImages?: string[];
}
