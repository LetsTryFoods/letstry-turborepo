import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SeoBaseInput {
    @Field({ nullable: true })
    metaTitle?: string;

    @Field({ nullable: true })
    metaDescription?: string;

    @Field(() => [String], { nullable: true })
    metaKeywords?: string[];

    @Field({ nullable: true })
    canonicalUrl?: string;

    @Field({ nullable: true })
    ogTitle?: string;

    @Field({ nullable: true })
    ogDescription?: string;

    @Field({ nullable: true })
    ogImage?: string;

    @Field({ nullable: true })
    twitterCard?: string;

    @Field({ nullable: true })
    twitterTitle?: string;

    @Field({ nullable: true })
    twitterDescription?: string;

    @Field({ nullable: true })
    twitterImage?: string;

    @Field({ nullable: true })
    robots?: string;

    @Field({ nullable: true })
    internalNote?: string;
}
