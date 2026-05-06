import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PressMentionService } from './press-mention.service';
import { PressMention } from './press-mention.graphql';
import {
  CreatePressMentionInput,
  UpdatePressMentionInput,
} from './press-mention.input';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Resolver(() => PressMention)
export class PressMentionResolver {
  constructor(private readonly pressMentionService: PressMentionService) {}

  // Admin-only: full list incl. inactive drafts.
  @Query(() => [PressMention], { name: 'pressMentions' })
  @Roles(Role.ADMIN)
  findAll() {
    return this.pressMentionService.findAll();
  }

  // Storefront-public: drives /press page coverage list.
  @Query(() => [PressMention], { name: 'activePressMentions' })
  @Public()
  findActive() {
    return this.pressMentionService.findActive();
  }

  // Admin-only: by-id read used in admin edit form.
  @Query(() => PressMention, { name: 'pressMention' })
  @Roles(Role.ADMIN)
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.pressMentionService.findOne(id);
  }

  // Storefront-public: would be used for an individual press-mention page
  // if one is ever added; safe to expose because mentions are public.
  @Query(() => PressMention, { name: 'pressMentionBySlug' })
  @Public()
  findBySlug(@Args('slug') slug: string) {
    return this.pressMentionService.findBySlug(slug);
  }

  @Mutation(() => PressMention)
  @Roles(Role.ADMIN)
  createPressMention(@Args('input') input: CreatePressMentionInput) {
    return this.pressMentionService.create(input);
  }

  @Mutation(() => PressMention)
  @Roles(Role.ADMIN)
  updatePressMention(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePressMentionInput,
  ) {
    return this.pressMentionService.update(id, input);
  }

  @Mutation(() => PressMention)
  @Roles(Role.ADMIN)
  removePressMention(@Args('id', { type: () => ID }) id: string) {
    return this.pressMentionService.remove(id);
  }
}
