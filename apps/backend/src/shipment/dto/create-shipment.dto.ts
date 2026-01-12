import { IsString, IsOptional, IsNumber, IsObject, IsArray, ValidateNested, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { ServiceType, LoadType } from '../entities/shipment.entity';

@InputType()
class AddressInput {
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

@InputType()
class DimensionInput {
  @Field(() => Float)
  @IsNumber()
  @Min(0)
  length: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  width: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  height: number;
}

@InputType()
class PieceDetailInput {
  @Field()
  @IsString()
  description: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  declaredValue: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  weight: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  height: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  length: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  width: number;
}

@InputType()
export class CreateShipmentInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  orderId?: string;

  @Field()
  @IsEnum(ServiceType)
  serviceType: string;

  @Field({ defaultValue: LoadType.NON_DOCUMENT })
  @IsEnum(LoadType)
  loadType: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  weight: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  declaredValue: number;

  @Field(() => DimensionInput)
  @IsObject()
  @ValidateNested()
  @Type(() => DimensionInput)
  dimensions: DimensionInput;

  @Field(() => AddressInput)
  @IsObject()
  @ValidateNested()
  @Type(() => AddressInput)
  originDetails: AddressInput;

  @Field(() => AddressInput)
  @IsObject()
  @ValidateNested()
  @Type(() => AddressInput)
  destinationDetails: AddressInput;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  codAmount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  codCollectionMode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  invoiceDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  ewayBill?: string;

  @Field()
  @IsString()
  commodityId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  numPieces?: number;

  @Field(() => [PieceDetailInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PieceDetailInput)
  piecesDetail?: PieceDetailInput[];
}
