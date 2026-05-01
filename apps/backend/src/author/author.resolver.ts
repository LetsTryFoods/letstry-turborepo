import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { AuthorService } from './author.service';
import { Author } from './author.graphql';
import { CreateAuthorInput, UpdateAuthorInput } from './author.input';

@Resolver(() => Author)
export class AuthorResolver {
  constructor(private readonly authorService: AuthorService) {}

  @Query(() => [Author], { name: 'authors' })
  findAll() {
    return this.authorService.findAll();
  }

  @Query(() => [Author], { name: 'activeAuthors' })
  findActive() {
    return this.authorService.findActive();
  }

  @Query(() => [Author], { name: 'teamMembers' })
  findTeam() {
    return this.authorService.findTeam();
  }

  @Query(() => Author, { name: 'author' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.authorService.findOne(id);
  }

  @Query(() => Author, { name: 'authorBySlug' })
  findBySlug(@Args('slug') slug: string) {
    return this.authorService.findBySlug(slug);
  }

  @Mutation(() => Author)
  createAuthor(@Args('input') input: CreateAuthorInput) {
    return this.authorService.create(input);
  }

  @Mutation(() => Author)
  updateAuthor(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateAuthorInput,
  ) {
    return this.authorService.update(id, input);
  }

  @Mutation(() => Author)
  removeAuthor(@Args('id', { type: () => ID }) id: string) {
    return this.authorService.remove(id);
  }
}
