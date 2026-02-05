import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateBlogInput {
    @Field()
    slug: string;

    @Field()
    title: string;

    @Field()
    excerpt: string;

    @Field()
    content: string;

    @Field({ nullable: true })
    image?: string;

    @Field({ nullable: true })
    date?: string;

    @Field()
    author: string;

    @Field()
    category: string;

    @Field({ nullable: true })
    isActive?: boolean;

    @Field(() => Number, { nullable: true })
    position?: number;
}

@InputType()
export class UpdateBlogInput {
    @Field({ nullable: true })
    slug?: string;

    @Field({ nullable: true })
    title?: string;

    @Field({ nullable: true })
    excerpt?: string;

    @Field({ nullable: true })
    content?: string;

    @Field({ nullable: true })
    image?: string;

    @Field({ nullable: true })
    date?: string;

    @Field({ nullable: true })
    author?: string;

    @Field({ nullable: true })
    category?: string;

    @Field({ nullable: true })
    isActive?: boolean;

    @Field(() => Number, { nullable: true })
    position?: number;
}
