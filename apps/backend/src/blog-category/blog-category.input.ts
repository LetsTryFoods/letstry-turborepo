import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateBlogCategoryInput {
    @Field()
    name: string;

    @Field()
    slug: string;

    @Field({ nullable: true })
    description?: string;

    @Field({ nullable: true })
    isActive?: boolean;

    @Field({ nullable: true })
    position?: number;
}

@InputType()
export class UpdateBlogCategoryInput {
    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    slug?: string;

    @Field({ nullable: true })
    description?: string;

    @Field({ nullable: true })
    isActive?: boolean;

    @Field({ nullable: true })
    position?: number;
}
