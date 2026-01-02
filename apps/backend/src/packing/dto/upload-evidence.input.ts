import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UploadEvidenceInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  packingOrderId: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  prePackImages?: string[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  postPackImages?: string[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  actualBoxCode?: string;
}
