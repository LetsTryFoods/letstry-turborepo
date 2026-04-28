import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, ValidateIf, IsOptional } from 'class-validator';

@InputType()
export class SubmitContactInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  orderId?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  queryType?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  message!: string;
}
