import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PillarService } from './pillar.service';
import { Pillar } from './pillar.graphql';
import { CreatePillarInput, UpdatePillarInput } from './pillar.input';

@Resolver(() => Pillar)
export class PillarResolver {
  constructor(private readonly pillarService: PillarService) {}

  @Query(() => [Pillar], { name: 'pillars' })
  findAll() {
    return this.pillarService.findAll();
  }

  @Query(() => [Pillar], { name: 'activePillars' })
  findActive() {
    return this.pillarService.findActive();
  }

  @Query(() => Pillar, { name: 'pillar' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.pillarService.findOne(id);
  }

  @Query(() => Pillar, { name: 'pillarBySlug' })
  findBySlug(@Args('slug') slug: string) {
    return this.pillarService.findBySlug(slug);
  }

  // Used by the storefront /[slug] dynamic route to resolve clean-URL
  // pillars before falling through to category lookup.
  @Query(() => Pillar, { name: 'pillarByCustomRoute', nullable: true })
  findByCustomRoute(@Args('route') route: string) {
    return this.pillarService.findByCustomRoute(route);
  }

  @Mutation(() => Pillar)
  createPillar(@Args('input') input: CreatePillarInput) {
    return this.pillarService.create(input);
  }

  @Mutation(() => Pillar)
  updatePillar(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePillarInput,
  ) {
    return this.pillarService.update(id, input);
  }

  @Mutation(() => Pillar)
  removePillar(@Args('id', { type: () => ID }) id: string) {
    return this.pillarService.remove(id);
  }
}
