import { IsString, IsNotEmpty } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class PackerLoginInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;
}
