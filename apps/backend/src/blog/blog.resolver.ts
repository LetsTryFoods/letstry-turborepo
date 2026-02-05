import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BlogService } from './blog.service';
import { Blog } from './blog.graphql';
import { CreateBlogInput, UpdateBlogInput } from './blog.input';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '../common/enums/role.enum';
import { Roles } from '../common/decorators/roles.decorator';

@Resolver(() => Blog)
export class BlogResolver {
    constructor(private readonly blogService: BlogService) { }

    @Query(() => [Blog], { name: 'blogs' })
    @Roles(Role.ADMIN)
    async getBlogs(): Promise<Blog[]> {
        return this.blogService.findAll();
    }

    @Query(() => [Blog], { name: 'activeBlogs' })
    @Public()
    async getActiveBlogs(): Promise<Blog[]> {
        return this.blogService.findActive();
    }

    @Query(() => Blog, { name: 'blog', nullable: true })
    @Public()
    async getBlog(
        @Args('id', { type: () => ID }) id: string,
    ): Promise<Blog | null> {
        try {
            return await this.blogService.findOne(id);
        } catch {
            return null;
        }
    }

    @Query(() => Blog, { name: 'blogBySlug', nullable: true })
    @Public()
    async getBlogBySlug(
        @Args('slug') slug: string,
    ): Promise<Blog | null> {
        try {
            return await this.blogService.findBySlug(slug);
        } catch {
            return null;
        }
    }

    @Mutation(() => Blog, { name: 'createBlog' })
    @Roles(Role.ADMIN)
    async createBlog(@Args('input') input: CreateBlogInput): Promise<Blog> {
        return this.blogService.create(input);
    }

    @Mutation(() => Blog, { name: 'updateBlog' })
    @Roles(Role.ADMIN)
    async updateBlog(
        @Args('id', { type: () => ID }) id: string,
        @Args('input') input: UpdateBlogInput,
    ): Promise<Blog> {
        return this.blogService.update(id, input);
    }

    @Mutation(() => Blog, { name: 'deleteBlog' })
    @Roles(Role.ADMIN)
    async deleteBlog(
        @Args('id', { type: () => ID }) id: string,
    ): Promise<Blog> {
        return this.blogService.remove(id);
    }
}
