import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { PincodeService } from './pincode.service';
import { PincodeInput, PincodeServiceabilityResult } from './dto/pincode.input';
import { Public } from '../common/decorators/public.decorator';

@Resolver()
export class PincodeResolver {
  constructor(private readonly pincodeService: PincodeService) { }

  @Public()
  @Query(() => PincodeServiceabilityResult)
  async checkPincodeServiceability(
    @Args('pincode') pincode: string,
  ): Promise<PincodeServiceabilityResult> {
    return this.pincodeService.checkServiceability(pincode);
  }

  @Public()
  @Mutation(() => Number)
  async bulkUpsertPincodes(
    @Args('pincodes', { type: () => [PincodeInput] }) pincodes: PincodeInput[],
  ): Promise<number> {
    return this.pincodeService.bulkUpsertPincodes(pincodes);
  }
}
