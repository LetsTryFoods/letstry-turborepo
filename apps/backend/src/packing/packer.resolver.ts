import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PackerService } from './services/packer.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreatePackerInput } from './dto/create-packer.input';
import { UpdatePackerInput } from './dto/update-packer.input';
import { PackerLoginInput } from './dto/packer-login.input';
import { FlagErrorInput } from './dto/flag-error.input';
import { Packer, PackerStats, PackerLoginResponse } from './types/packer.type';
import { ScanLog } from './types/scan-log.type';

@Resolver()
export class PackerResolver {
  constructor(private readonly packerService: PackerService) {}

  @Mutation(() => Packer)
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async createPacker(@Args('input') input: CreatePackerInput): Promise<any> {
    return this.packerService.createPacker(input);
  }

  @Mutation(() => Packer)
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async updatePacker(
    @Args('packerId') packerId: string,
    @Args('input') input: UpdatePackerInput,
  ): Promise<any> {
    return this.packerService.updatePacker(packerId, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async deletePacker(@Args('packerId') packerId: string): Promise<any> {
    return this.packerService.deletePacker(packerId);
  }

  @Query(() => [Packer])
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getAllPackers(@Args('isActive') isActive?: boolean): Promise<any[]> {
    return this.packerService.getAllPackers({ isActive });
  }

  @Query(() => Packer)
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getPackerById(@Args('packerId') packerId: string): Promise<any> {
    return this.packerService.getPackerById(packerId);
  }

  @Query(() => PackerStats)
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getPackerStats(
    @Args('packerId') packerId: string,
    @Args('startDate') startDate?: Date,
    @Args('endDate') endDate?: Date,
  ): Promise<any> {
    return this.packerService.getPackerStats(packerId, { startDate, endDate });
  }

  @Mutation(() => PackerLoginResponse)
  async packerLogin(@Args('input') input: PackerLoginInput): Promise<any> {
    return this.packerService.login(input.employeeId, input.password);
  }

  @Mutation(() => ScanLog)
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async flagPackingError(@Args('input') input: FlagErrorInput): Promise<any> {
    return this.packerService.flagRetrospectiveError(input);
  }
}
