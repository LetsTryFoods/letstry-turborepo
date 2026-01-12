import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class ShipmentAddressInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  phone: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @Field()
  @IsString()
  addressLine1: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @Field()
  @IsString()
  pincode: string;

  @Field()
  @IsString()
  city: string;

  @Field()
  @IsString()
  state: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  latitude?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  longitude?: string;
}
