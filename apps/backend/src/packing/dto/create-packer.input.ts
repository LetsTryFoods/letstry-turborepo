import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreatePackerInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;
}
