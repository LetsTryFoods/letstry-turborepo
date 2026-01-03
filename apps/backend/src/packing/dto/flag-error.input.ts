import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { ErrorSeverity } from '../../common/enums/error-severity.enum';

registerEnumType(ErrorSeverity, {
  name: 'ErrorSeverity',
});

@InputType()
export class FlagErrorInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  packingOrderId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  errorType: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  ean?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  notes: string;

  @Field(() => ErrorSeverity)
  @IsEnum(ErrorSeverity)
  severity: ErrorSeverity;

  @Field()
  @IsString()
  @IsNotEmpty()
  source: string;
}
