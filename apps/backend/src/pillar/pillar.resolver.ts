import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PillarService } from './pillar.service';
import { Pillar } from './pillar.graphql';
import { CreatePillarInput, UpdatePillarInput } from './pillar.input';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Resolver(() => Pillar)
export class PillarResolver {
  constructor(private readonly pillarService: PillarService) {}

  // Admin-only: full list incl. inactive drafts.
  @Query(() => [Pillar], { name: 'pillars' })
  @Roles(Role.ADMIN)
  findAll() {
    return this.pillarService.findAll();
  }

  // Storefront-public: rendered on every page with a "Related pillars" rail.
  @Query(() => [Pillar], { name: 'activePillars' })
  @Public()
  findActive() {
    return this.pillarService.findActive();
  }

  // Admin-only: by-id read used in admin edit form (loads any pillar incl.
  // inactive). Storefront uses pillarBySlug / pillarByCustomRoute instead.
  @Query(() => Pillar, { name: 'pillar' })
  @Roles(Role.ADMIN)
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.pillarService.findOne(id);
  }

  // Storefront-public: drives /p/<slug> CMS-driven landing page.
  @Query(() => Pillar, { name: 'pillarBySlug' })
  @Public()
  findBySlug(@Args('slug') slug: string) {
    return this.pillarService.findBySlug(slug);
  }

  // Storefront-public: used by /[slug] dynamic route + the dedicated
  // /no-palm-oil-snacks route to resolve clean-URL pillars before falling
  // through to category lookup.
  @Query(() => Pillar, { name: 'pillarByCustomRoute', nullable: true })
  @Public()
  findByCustomRoute(@Args('route') route: string) {
    return this.pillarService.findByCustomRoute(route);
  }

  @Mutation(() => Pillar)
  @Roles(Role.ADMIN)
  createPillar(@Args('input') input: CreatePillarInput) {
    return this.pillarService.create(input);
  }

  @Mutation(() => Pillar)
  @Roles(Role.ADMIN)
  updatePillar(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePillarInput,
  ) {
    return this.pillarService.update(id, input);
  }

  @Mutation(() => Pillar)
  @Roles(Role.ADMIN)
  removePillar(@Args('id', { type: () => ID }) id: string) {
    return this.pillarService.remove(id);
  }
}
