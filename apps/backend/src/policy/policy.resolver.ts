import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { PolicyService } from './policy.service';
import { PolicySeoService } from './policy-seo.service';
import { Policy } from './policy.graphql';
import { PolicySeo } from './policy-seo.schema';
import { PolicySeoInput } from './policy-seo.input';
import { CreatePolicyInput, UpdatePolicyInput } from './policy.input';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Resolver(() => Policy)
export class PolicyResolver {
  constructor(
    private readonly policyService: PolicyService,
    private readonly policySeoService: PolicySeoService,
  ) { }

  @Query(() => [Policy], { name: 'policies' })
  @Public()
  async getPolicies(): Promise<Policy[]> {
    return this.policyService.findAll();
  }

  @Query(() => [Policy], { name: 'policiesByType' })
  @Public()
  async getPoliciesByType(@Args('type') type: string): Promise<Policy[]> {
    return this.policyService.findByType(type);
  }

  @Query(() => Policy, { name: 'policy', nullable: true })
  @Public()
  async getPolicy(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Policy | null> {
    try {
      return await this.policyService.findOne(id);
    } catch {
      return null;
    }
  }

  @Mutation(() => Policy, { name: 'createPolicy' })
  @Roles(Role.ADMIN)
  async createPolicy(@Args('input') input: CreatePolicyInput): Promise<Policy> {
    return this.policyService.create(input);
  }

  @Mutation(() => Policy, { name: 'updatePolicy' })
  @Roles(Role.ADMIN)
  async updatePolicy(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePolicyInput,
  ): Promise<Policy> {
    return this.policyService.update(id, input);
  }

  @Mutation(() => Policy, { name: 'deletePolicy' })
  @Roles(Role.ADMIN)
  async deletePolicy(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Policy> {
    return this.policyService.remove(id);
  }

  @ResolveField(() => PolicySeo, { name: 'seo', nullable: true })
  @Public()
  async getSeo(@Parent() policy: Policy): Promise<PolicySeo | null> {
    return this.policySeoService.findByPolicyId(policy._id);
  }

  @Mutation(() => PolicySeo, { name: 'updatePolicySeo' })
  @Roles(Role.ADMIN)
  async updatePolicySeo(
    @Args('policyId', { type: () => ID }) policyId: string,
    @Args('input') input: PolicySeoInput,
  ): Promise<PolicySeo | null> {
    return this.policySeoService.update(policyId, input);
  }

  @Mutation(() => Boolean, { name: 'deletePolicySeo' })
  @Roles(Role.ADMIN)
  async deletePolicySeo(
    @Args('policyId', { type: () => ID }) policyId: string,
  ): Promise<boolean> {
    await this.policySeoService.delete(policyId);
    return true;
  }
}
