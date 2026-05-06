import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { AuthorService } from './author.service';
import { Author } from './author.graphql';
import { CreateAuthorInput, UpdateAuthorInput } from './author.input';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Resolver(() => Author)
export class AuthorResolver {
  constructor(private readonly authorService: AuthorService) {}

  // Admin-only: full list incl. inactive drafts.
  @Query(() => [Author], { name: 'authors' })
  @Roles(Role.ADMIN)
  findAll() {
    return this.authorService.findAll();
  }

  // Storefront-public: used by blog bylines and pillar author rails.
  @Query(() => [Author], { name: 'activeAuthors' })
  @Public()
  findActive() {
    return this.authorService.findActive();
  }

  // Storefront-public: drives /team page.
  @Query(() => [Author], { name: 'teamMembers' })
  @Public()
  findTeam() {
    return this.authorService.findTeam();
  }

  // Admin-only: by-id read used in admin edit form.
  @Query(() => Author, { name: 'author' })
  @Roles(Role.ADMIN)
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.authorService.findOne(id);
  }

  // Storefront-public: drives /author/<slug> profile pages and Person
  // schema linked from blog posts.
  @Query(() => Author, { name: 'authorBySlug' })
  @Public()
  findBySlug(@Args('slug') slug: string) {
    return this.authorService.findBySlug(slug);
  }

  @Mutation(() => Author)
  @Roles(Role.ADMIN)
  createAuthor(@Args('input') input: CreateAuthorInput) {
    return this.authorService.create(input);
  }

  @Mutation(() => Author)
  @Roles(Role.ADMIN)
  updateAuthor(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateAuthorInput,
  ) {
    return this.authorService.update(id, input);
  }

  @Mutation(() => Author)
  @Roles(Role.ADMIN)
  removeAuthor(@Args('id', { type: () => ID }) id: string) {
    return this.authorService.remove(id);
  }
}
