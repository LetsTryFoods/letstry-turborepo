import {
  ObjectType,
  Field,
  ID,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';

@ObjectType()
export class AuthorSocialLinkType {
  @Field() platform: string;
  @Field() url: string;
}

@ObjectType()
export class Author {
  @Field(() => ID) _id: string;
  @Field() slug: string;
  @Field() name: string;
  @Field({ nullable: true }) jobTitle?: string;
  @Field({ nullable: true }) bio?: string;
  @Field({ nullable: true }) photoUrl?: string;
  @Field({ nullable: true }) publicEmail?: string;
  @Field(() => [String]) expertise: string[];
  @Field(() => [String]) credentials: string[];
  @Field(() => [AuthorSocialLinkType]) socialLinks: AuthorSocialLinkType[];
  @Field() isFounder: boolean;
  @Field() isTeamMember: boolean;
  @Field() isActive: boolean;
  @Field(() => Int) position: number;
  @Field(() => GraphQLISODateTime) createdAt: Date;
  @Field(() => GraphQLISODateTime) updatedAt: Date;
}
