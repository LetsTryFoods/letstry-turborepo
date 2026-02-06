import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BlogCategoryService } from './blog-category.service';
import { BlogCategory } from './blog-category.graphql';
import { CreateBlogCategoryInput, UpdateBlogCategoryInput } from './blog-category.input';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '../common/enums/role.enum';
import { Roles } from '../common/decorators/roles.decorator';

@Resolver(() => BlogCategory)
export class BlogCategoryResolver {
    constructor(private readonly blogCategoryService: BlogCategoryService) { }

    @Query(() => [BlogCategory], { name: 'blogCategories' })
    @Roles(Role.ADMIN)
    async getBlogCategories(): Promise<BlogCategory[]> {
        return this.blogCategoryService.findAll();
    }

    @Query(() => [BlogCategory], { name: 'activeBlogCategories' })
    @Public()
    async getActiveBlogCategories(): Promise<BlogCategory[]> {
        return this.blogCategoryService.findActive();
    }

    @Query(() => BlogCategory, { name: 'blogCategory', nullable: true })
    @Public()
    async getBlogCategory(
        @Args('id', { type: () => ID }) id: string,
    ): Promise<BlogCategory | null> {
        try {
            return await this.blogCategoryService.findOne(id);
        } catch {
            return null;
        }
    }

    @Mutation(() => BlogCategory, { name: 'createBlogCategory' })
    @Roles(Role.ADMIN)
    async createBlogCategory(@Args('input') input: CreateBlogCategoryInput): Promise<BlogCategory> {
        return this.blogCategoryService.create(input);
    }

    @Mutation(() => BlogCategory, { name: 'updateBlogCategory' })
    @Roles(Role.ADMIN)
    async updateBlogCategory(
        @Args('id', { type: () => ID }) id: string,
        @Args('input') input: UpdateBlogCategoryInput,
    ): Promise<BlogCategory> {
        return this.blogCategoryService.update(id, input);
    }

    @Mutation(() => BlogCategory, { name: 'deleteBlogCategory' })
    @Roles(Role.ADMIN)
    async deleteBlogCategory(
        @Args('id', { type: () => ID }) id: string,
    ): Promise<BlogCategory> {
        return this.blogCategoryService.remove(id);
    }
}
