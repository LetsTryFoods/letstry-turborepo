import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RedirectService } from './redirect.service';
import { RedirectType, PaginatedRedirects, CreateRedirectInput, UpdateRedirectInput } from './redirect.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '../common/enums/role.enum';

@Resolver(() => RedirectType)
export class RedirectResolver {
  constructor(private readonly redirectService: RedirectService) {}

  @Mutation(() => RedirectType)
  @Roles(Role.ADMIN)
  async createRedirect(
    @Args('input') createRedirectInput: CreateRedirectInput,
  ): Promise<RedirectType> {
    return this.redirectService.create(createRedirectInput) as any;
  }

  @Query(() => PaginatedRedirects)
  @Roles(Role.ADMIN)
  async redirects(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Args('search', { nullable: true }) search?: string,
  ): Promise<PaginatedRedirects> {
    return this.redirectService.findAll(page, limit, search) as any;
  }

  @Query(() => RedirectType)
  @Roles(Role.ADMIN)
  async redirect(@Args('id') id: string): Promise<RedirectType> {
    return this.redirectService.findOne(id) as any;
  }

  @Query(() => RedirectType, { nullable: true })
  @Public()
  async redirectByPath(@Args('fromPath') fromPath: string): Promise<RedirectType | null> {
    return this.redirectService.findByFromPath(fromPath) as any;
  }

  @Mutation(() => RedirectType)
  @Roles(Role.ADMIN)
  async updateRedirect(
    @Args('id') id: string,
    @Args('input') updateRedirectInput: UpdateRedirectInput,
  ): Promise<RedirectType> {
    return this.redirectService.update(id, updateRedirectInput) as any;
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  async deleteRedirect(@Args('id') id: string): Promise<boolean> {
    return this.redirectService.remove(id);
  }

  @Public()
  @Query(() => [RedirectType])
  async allActiveRedirects(): Promise<RedirectType[]> {
    return this.redirectService.getAllActiveRedirects() as any;
  }
}
