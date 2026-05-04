import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PressMentionService } from './press-mention.service';
import { PressMention } from './press-mention.graphql';
import {
  CreatePressMentionInput,
  UpdatePressMentionInput,
} from './press-mention.input';

@Resolver(() => PressMention)
export class PressMentionResolver {
  constructor(private readonly pressMentionService: PressMentionService) {}

  @Query(() => [PressMention], { name: 'pressMentions' })
  findAll() {
    return this.pressMentionService.findAll();
  }

  @Query(() => [PressMention], { name: 'activePressMentions' })
  findActive() {
    return this.pressMentionService.findActive();
  }

  @Query(() => PressMention, { name: 'pressMention' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.pressMentionService.findOne(id);
  }

  @Query(() => PressMention, { name: 'pressMentionBySlug' })
  findBySlug(@Args('slug') slug: string) {
    return this.pressMentionService.findBySlug(slug);
  }

  @Mutation(() => PressMention)
  createPressMention(@Args('input') input: CreatePressMentionInput) {
    return this.pressMentionService.create(input);
  }

  @Mutation(() => PressMention)
  updatePressMention(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePressMentionInput,
  ) {
    return this.pressMentionService.update(id, input);
  }

  @Mutation(() => PressMention)
  removePressMention(@Args('id', { type: () => ID }) id: string) {
    return this.pressMentionService.remove(id);
  }
}
