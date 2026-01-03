import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { BoxSizeService } from './services/box-size.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreateBoxSizeInput } from './dto/create-box-size.input';
import { UpdateBoxSizeInput } from './dto/update-box-size.input';
import { BoxSize } from './types/box-size.type';

@Resolver()
export class BoxSizeResolver {
  constructor(private readonly boxSizeService: BoxSizeService) {}

  @Mutation(() => BoxSize)
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async createBoxSize(@Args('input', { type: () => CreateBoxSizeInput }) input: CreateBoxSizeInput): Promise<any> {
    return this.boxSizeService.createBoxSize(input);
  }

  @Mutation(() => BoxSize)
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async updateBoxSize(
    @Args('boxId') boxId: string,
    @Args('input', { type: () => UpdateBoxSizeInput }) input: UpdateBoxSizeInput,
  ): Promise<any> {
    return this.boxSizeService.updateBoxSize(boxId, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async deleteBoxSize(@Args('boxId') boxId: string): Promise<any> {
    return this.boxSizeService.deleteBoxSize(boxId);
  }

  @Query(() => [BoxSize])
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getAllBoxSizes(): Promise<any[]> {
    return this.boxSizeService.getAllBoxSizes();
  }

  @Query(() => [BoxSize])
  async getActiveBoxSizes(): Promise<any[]> {
    return this.boxSizeService.getActiveBoxSizes();
  }
}
