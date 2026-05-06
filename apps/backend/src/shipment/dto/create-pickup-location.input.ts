import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

@InputType()
export class CreatePickupLocationInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  phone?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  addressLine1?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  addressLine2?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  city?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  state?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  pincode?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  country?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  provider?: string;
}
