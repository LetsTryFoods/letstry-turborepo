import { InputType, Field, Int, GraphQLISODateTime } from '@nestjs/graphql';

@InputType()
export class CreatePressMentionInput {
  @Field() slug: string;
  @Field() publication: string;
  @Field({ nullable: true }) publicationLogoUrl?: string;
  @Field() headline: string;
  @Field() url: string;
  @Field({ nullable: true }) excerpt?: string;
  @Field({ nullable: true }) coverImageUrl?: string;
  @Field(() => GraphQLISODateTime) publishedAt: Date;
  @Field({ nullable: true }) category?: string;
  @Field({ nullable: true }) isActive?: boolean;
  @Field(() => Int, { nullable: true }) position?: number;
}

@InputType()
export class UpdatePressMentionInput {
  @Field({ nullable: true }) slug?: string;
  @Field({ nullable: true }) publication?: string;
  @Field({ nullable: true }) publicationLogoUrl?: string;
  @Field({ nullable: true }) headline?: string;
  @Field({ nullable: true }) url?: string;
  @Field({ nullable: true }) excerpt?: string;
  @Field({ nullable: true }) coverImageUrl?: string;
  @Field(() => GraphQLISODateTime, { nullable: true }) publishedAt?: Date;
  @Field({ nullable: true }) category?: string;
  @Field({ nullable: true }) isActive?: boolean;
  @Field(() => Int, { nullable: true }) position?: number;
}
