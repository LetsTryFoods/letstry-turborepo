import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PickupLocationType } from '../dto/pickup-location.type';
import { PickupLocationService } from '../services/pickup-location.service';
import { CreatePickupLocationInput } from '../dto/create-pickup-location.input';
import { JwtAuthGuard } from '../../authentication/common/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Resolver(() => PickupLocationType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class PickupLocationResolver {
  constructor(private readonly pickupLocationService: PickupLocationService) {}

  @Query(() => [PickupLocationType])
  @Roles(Role.ADMIN)
  async getPickupLocations() {
    return this.pickupLocationService.findAll();
  }

  @Mutation(() => PickupLocationType)
  @Roles(Role.ADMIN)
  async createPickupLocation(@Args('input') input: CreatePickupLocationInput) {
    return this.pickupLocationService.create(input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  async removePickupLocation(@Args('id') id: string) {
    return this.pickupLocationService.remove(id);
  }
}
