import { InputType, Field, Int, ObjectType } from '@nestjs/graphql';
import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class CreateRedirectInput {
  @Field()
  @IsString()
  fromPath: string;

  @Field()
  @IsString()
  toPath: string;

  @Field(() => Int, { defaultValue: 301 })
  @IsInt()
  @IsOptional()
  statusCode?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ defaultValue: 'shopify' })
  @IsString()
  @IsOptional()
  source?: string;

  @Field({ defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@InputType()
export class UpdateRedirectInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fromPath?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  toPath?: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  statusCode?: number;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  source?: string;
}

@ObjectType()
export class RedirectType {
  @Field()
  _id: string;

  @Field()
  fromPath: string;

  @Field()
  toPath: string;

  @Field(() => Int)
  statusCode: number;

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  description?: string;

  @Field()
  source: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PaginatedRedirects {
  @Field(() => [RedirectType])
  data: RedirectType[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}
