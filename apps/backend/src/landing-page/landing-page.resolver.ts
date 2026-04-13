import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { LandingPageService } from './landing-page.service';
import { LandingPage } from './landing-page.graphql';
import { CreateLandingPageInput, UpdateLandingPageInput } from './landing-page.input';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Resolver(() => LandingPage)
export class LandingPageResolver {
  constructor(private readonly landingPageService: LandingPageService) {}

  @Query(() => [LandingPage], { name: 'landingPages' })
  @Roles(Role.ADMIN)
  async getLandingPages(): Promise<LandingPage[]> {
    return this.landingPageService.findAll();
  }

  @Query(() => [LandingPage], { name: 'activeLandingPages' })
  @Public()
  async getActiveLandingPages(): Promise<LandingPage[]> {
    return this.landingPageService.findActive();
  }

  @Query(() => LandingPage, { name: 'landingPage', nullable: true })
  @Roles(Role.ADMIN)
  async getLandingPage(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<LandingPage | null> {
    try {
      return await this.landingPageService.findOne(id);
    } catch {
      return null;
    }
  }

  @Query(() => LandingPage, { name: 'landingPageBySlug', nullable: true })
  @Public()
  async getLandingPageBySlug(
    @Args('slug') slug: string,
  ): Promise<LandingPage | null> {
    try {
      return await this.landingPageService.findBySlug(slug);
    } catch {
      return null;
    }
  }

  @Mutation(() => LandingPage, { name: 'createLandingPage' })
  @Roles(Role.ADMIN)
  async createLandingPage(@Args('input') input: CreateLandingPageInput): Promise<LandingPage> {
    return this.landingPageService.create(input);
  }

  @Mutation(() => LandingPage, { name: 'updateLandingPage' })
  @Roles(Role.ADMIN)
  async updateLandingPage(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateLandingPageInput,
  ): Promise<LandingPage> {
    return this.landingPageService.update(id, input);
  }

  @Mutation(() => LandingPage, { name: 'deleteLandingPage' })
  @Roles(Role.ADMIN)
  async deleteLandingPage(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<LandingPage> {
    return this.landingPageService.remove(id);
  }
}
