import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ShipmentStatusCode } from '../entities/shipment.entity';
import { PaginationInput } from '../../common/pagination';

@InputType()
export class ShipmentFiltersInput extends PaginationInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  orderId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(ShipmentStatusCode)
  statusCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isDelivered?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isCancelled?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bookedFrom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bookedTo?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  awbNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  referenceNumber?: string;
}
