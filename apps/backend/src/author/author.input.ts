import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class AuthorSocialLinkInput {
  @Field() platform: string;
  @Field() url: string;
}

@InputType()
export class CreateAuthorInput {
  @Field() slug: string;
  @Field() name: string;
  @Field({ nullable: true }) jobTitle?: string;
  @Field({ nullable: true }) bio?: string;
  @Field({ nullable: true }) photoUrl?: string;
  @Field({ nullable: true }) publicEmail?: string;
  @Field(() => [String], { nullable: true }) expertise?: string[];
  @Field(() => [String], { nullable: true }) credentials?: string[];
  @Field(() => [AuthorSocialLinkInput], { nullable: true })
  socialLinks?: AuthorSocialLinkInput[];
  @Field({ nullable: true }) isFounder?: boolean;
  @Field({ nullable: true }) isTeamMember?: boolean;
  @Field({ nullable: true }) isActive?: boolean;
  @Field(() => Int, { nullable: true }) position?: number;
}

@InputType()
export class UpdateAuthorInput {
  @Field({ nullable: true }) slug?: string;
  @Field({ nullable: true }) name?: string;
  @Field({ nullable: true }) jobTitle?: string;
  @Field({ nullable: true }) bio?: string;
  @Field({ nullable: true }) photoUrl?: string;
  @Field({ nullable: true }) publicEmail?: string;
  @Field(() => [String], { nullable: true }) expertise?: string[];
  @Field(() => [String], { nullable: true }) credentials?: string[];
  @Field(() => [AuthorSocialLinkInput], { nullable: true })
  socialLinks?: AuthorSocialLinkInput[];
  @Field({ nullable: true }) isFounder?: boolean;
  @Field({ nullable: true }) isTeamMember?: boolean;
  @Field({ nullable: true }) isActive?: boolean;
  @Field(() => Int, { nullable: true }) position?: number;
}
