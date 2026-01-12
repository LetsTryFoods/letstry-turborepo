import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class WebhookPayloadDto {
  @IsString()
  @IsNotEmpty()
  reference_number: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  action_date?: string;

  @IsString()
  @IsOptional()
  action_time?: string;

  @IsString()
  @IsOptional()
  latitude?: string;

  @IsString()
  @IsOptional()
  longitude?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsString()
  @IsOptional()
  non_delivery_reason?: string;

  @IsString()
  @IsOptional()
  scd_otp?: string;

  @IsString()
  @IsOptional()
  ndc_otp?: string;
}
