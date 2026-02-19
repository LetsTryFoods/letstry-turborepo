import { Resolver, Query, Mutation, Args, Context, ResolveField, Parent, ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PackingService } from './services/packing.service';
import { PackerService } from './services/packer.service';
import { QueueCleanupService } from './services/domain/queue-cleanup.service';
import { PackerAuthGuard } from './guards/packer-auth.guard';
import { JwtAuthGuard } from '../authentication/common/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

import { UploadEvidenceInput } from './dto/upload-evidence.input';
import { BatchScanInput } from './dto/batch-scan.input';
import { AdminPunchShipmentInput } from './dto/admin-punch-shipment.input';
import { BatchScanResult } from './dto/batch-scan.result';
import { PackingOrder } from './types/packing-order.type';
import { ScanLog } from './types/scan-log.type';
import { BoxSize } from '../box-size/types/box-size.type';
import { PackingEvidence } from './types/packing-evidence.type';

@ObjectType()
class CleanupResult {
  @Field(() => Int)
  removed: number;

  @Field(() => Int)
  checked: number;
}

@Resolver(() => PackingOrder)
export class PackingResolver {
  constructor(
    private readonly packingService: PackingService,
    private readonly packerService: PackerService,
    private readonly queueCleanupService: QueueCleanupService,
  ) {
    console.log('PackingResolver initialized');
  }

  @ResolveField()
  id(@Parent() packingOrder: any): string {
    return packingOrder._id?.toString() || packingOrder.id;
  }

  @ResolveField()
  async packerName(@Parent() packingOrder: any): Promise<string | null> {
    if (!packingOrder.assignedTo) {
      return null;
    }
    const packer = await this.packerService.getPackerById(packingOrder.assignedTo);
    return packer?.name || null;
  }

  @Query(() => PackingOrder)
  @UseGuards(PackerAuthGuard, RolesGuard)
  @Roles(Role.PACKER, Role.ADMIN)
  async getAssignedOrder(@Context() ctx): Promise<any> {
    return this.packingService.assignOrderToPacker(ctx.req.user.packerId);
  }

  @Query(() => [PackingOrder])
  @UseGuards(PackerAuthGuard, RolesGuard)
  @Roles(Role.PACKER, Role.ADMIN)
  async getMyAssignedOrders(@Context() ctx): Promise<any[]> {
    return this.packingService.getPackerAssignedOrders(ctx.req.user.packerId);
  }

  @Mutation(() => PackingOrder)
  @UseGuards(PackerAuthGuard, RolesGuard)
  @Roles(Role.PACKER)
  async startPacking(
    @Args('packingOrderId') packingOrderId: string,
  ): Promise<any> {
    return this.packingService.startPacking(packingOrderId);
  }



  @Mutation(() => BatchScanResult)
  @UseGuards(PackerAuthGuard, RolesGuard)
  @Roles(Role.PACKER)
  async batchScanItems(
    @Args('input', { type: () => BatchScanInput }) input: BatchScanInput,
    @Context() ctx,
  ): Promise<BatchScanResult> {
    return this.packingService.batchScanItems(
      input.packingOrderId,
      input.items,
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
      ctx.req.user.packerId,
    );
  }

  @Mutation(() => PackingOrder)
  @UseGuards(PackerAuthGuard, RolesGuard)
  @Roles(Role.PACKER)
  async completePacking(
    @Args('packingOrderId') packingOrderId: string,
    @Context() ctx,
  ): Promise<any> {
    return this.packingService.completePacking(packingOrderId, ctx.req.user.packerId);
  }

  @Mutation(() => PackingOrder)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async adminPunchShipment(
    @Args('input') input: AdminPunchShipmentInput,
  ): Promise<any> {
    return this.packingService.adminPunchShipment(input);
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

  @Mutation(() => CleanupResult)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async cleanupOrphanedJobs(): Promise<CleanupResult> {
    return this.queueCleanupService.cleanupOrphanedJobs();
  }
}

@Resolver(() => ScanLog)
export class ScanLogResolver {
  @ResolveField(() => ID)
  id(@Parent() scanLog: any): string {
    return scanLog._id?.toString() || scanLog.id;
  }
}
