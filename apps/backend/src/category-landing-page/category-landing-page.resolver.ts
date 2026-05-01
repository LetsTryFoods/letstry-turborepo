import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CategoryLandingPageService } from './category-landing-page.service';
import {
  CategoryLandingPageType,
  CreateCategoryLandingPageInput,
  UpdateCategoryLandingPageInput,
} from './category-landing-page.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Resolver(() => CategoryLandingPageType)
export class CategoryLandingPageResolver {
  constructor(private readonly service: CategoryLandingPageService) {}

  @Query(() => [CategoryLandingPageType], { name: 'categoryLandingPages' })
  @Roles(Role.ADMIN)
  findAll(): Promise<CategoryLandingPageType[]> {
    return this.service.findAll();
  }

  @Query(() => CategoryLandingPageType, { name: 'categoryLandingPage', nullable: true })
  @Roles(Role.ADMIN)
  findOne(@Args('id', { type: () => ID }) id: string): Promise<CategoryLandingPageType> {
    return this.service.findOne(id);
  }

  @Query(() => CategoryLandingPageType, { name: 'categoryLandingPageBySlug', nullable: true })
  @Public()
  findBySlug(@Args('slug') slug: string): Promise<CategoryLandingPageType | null> {
    return this.service.findBySlug(slug);
  }

  @Mutation(() => CategoryLandingPageType, { name: 'createCategoryLandingPage' })
  @Roles(Role.ADMIN)
  create(@Args('input') input: CreateCategoryLandingPageInput): Promise<CategoryLandingPageType> {
    return this.service.create(input);
  }

  @Mutation(() => CategoryLandingPageType, { name: 'updateCategoryLandingPage' })
  @Roles(Role.ADMIN)
  update(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCategoryLandingPageInput,
  ): Promise<CategoryLandingPageType> {
    return this.service.update(id, input);
  }

  @Mutation(() => CategoryLandingPageType, { name: 'deleteCategoryLandingPage' })
  @Roles(Role.ADMIN)
  remove(@Args('id', { type: () => ID }) id: string): Promise<CategoryLandingPageType> {
    return this.service.remove(id);
  }
}
