import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PackingService } from './services/packing.service';
import { PackerAuthGuard } from './guards/packer-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ScanItemInput } from './dto/scan-item.input';
import { UploadEvidenceInput } from './dto/upload-evidence.input';
import { PackingOrder } from './types/packing-order.type';
import { ScanLog } from './types/scan-log.type';
import { BoxSize } from '../box-size/types/box-size.type';
import { PackingEvidence } from './types/packing-evidence.type';

@Resolver()
export class PackingResolver {
  constructor(private readonly packingService: PackingService) {}

  @Query(() => PackingOrder)
  @UseGuards(PackerAuthGuard, RolesGuard)
  @Roles(Role.PACKER, Role.ADMIN)
  async getAssignedOrder(@Context() ctx): Promise<any> {
    return this.packingService.assignOrderToPacker(ctx.req.user.packerId);
  }

  @Mutation(() => PackingOrder)
  @UseGuards(PackerAuthGuard, RolesGuard)
  @Roles(Role.PACKER)
  async startPacking(
    @Args('packingOrderId') packingOrderId: string,
  ): Promise<any> {
    return this.packingService.startPacking(packingOrderId);
  }

  @Mutation(() => ScanLog)
  @UseGuards(PackerAuthGuard, RolesGuard)
  @Roles(Role.PACKER)
  async scanItem(
    @Args('input', { type: () => ScanItemInput }) input: ScanItemInput,
    @Context() ctx,
  ): Promise<any> {
    return this.packingService.scanItem(
      input.packingOrderId,
      input.ean,
      ctx.req.user.packerId,
    );
  }

  @Mutation(() => PackingOrder)
  @UseGuards(PackerAuthGuard, RolesGuard)
  @Roles(Role.PACKER)
  async uploadEvidence(
    @Args('input', { type: () => UploadEvidenceInput }) input: UploadEvidenceInput,
    @Context() ctx,
  ): Promise<any> {
    return this.packingService.uploadEvidence(
      input.packingOrderId,
      input.prePackImages || [],
      input.actualBoxCode || '',
    );
  }

  @Mutation(() => PackingOrder)
  @UseGuards(PackerAuthGuard, RolesGuard)
  @Roles(Role.PACKER)
  async completePacking(
    @Args('packingOrderId') packingOrderId: string,
  ): Promise<any> {
    return this.packingService.completePacking(packingOrderId);
  }

  @Query(() => BoxSize)
  @UseGuards(PackerAuthGuard, RolesGuard)
  @Roles(Role.PACKER, Role.ADMIN)
  async getBoxRecommendation(
    @Args('packingOrderId') packingOrderId: string,
  ): Promise<any> {
    return this.packingService.getBoxRecommendation(packingOrderId);
  }

  @Query(() => [PackingOrder])
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getAllPackingOrders(
    @Args('packerId', { nullable: true }) packerId?: string,
    @Args('status', { nullable: true }) status?: string,
  ): Promise<any[]> {
    return this.packingService.getAllPackingOrders({ packerId, status });
  }

  @Query(() => PackingEvidence)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getEvidenceByOrder(
    @Args('packingOrderId') packingOrderId: string,
  ): Promise<any> {
    return this.packingService.getEvidenceByOrder(packingOrderId);
  }
}
