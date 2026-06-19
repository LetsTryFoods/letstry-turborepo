import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  ResolveField,
  Parent,
  ObjectType,
  Field,
  Int,
  ID,
  Float,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PackingService } from './services/packing.service';
import { PackerService } from './services/packer.service';
import { QueueCleanupService } from './services/domain/queue-cleanup.service';
import { PackingQueueService } from './services/domain/packing-queue.service';
import { OrderRepository } from '../order/services/order.repository';
import { Types } from 'mongoose';
import { PackerAuthGuard } from './guards/packer-auth.guard';
import { JwtAuthGuard } from '../authentication/common/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

import { UploadEvidenceInput } from './dto/upload-evidence.input';
import { BatchScanInput } from './dto/batch-scan.input';
import { AdminPunchShipmentInput } from './dto/admin-punch-shipment.input';
import { BatchScanResult } from './dto/batch-scan.result';
import { PackingOrder, ShippingInfo, ShipmentInfo } from './types/packing-order.type';
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

@ObjectType()
class DeliveryRecommendation {
  @Field()
  recommendedProvider: string;

  @Field()
  reason: string;
}

@Resolver(() => PackingOrder)
export class PackingResolver {
  constructor(
    private readonly packingService: PackingService,
    private readonly packerService: PackerService,
    private readonly queueCleanupService: QueueCleanupService,
    private readonly packingQueueService: PackingQueueService,
    private readonly orderRepository: OrderRepository,
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
    const packer = await this.packerService.getPackerById(
      packingOrder.assignedTo,
    );
    return packer?.name || null;
  }

  @ResolveField(() => PackingEvidence, { nullable: true })
  async evidence(@Parent() packingOrder: any): Promise<any> {
    const id = packingOrder._id?.toString() || packingOrder.id;
    return this.packingService.getEvidenceByOrder(id);
  }

  @ResolveField(() => ShippingInfo, { nullable: true })
  async shippingInfo(@Parent() packingOrder: any): Promise<any> {
    return this.packingService.getShippingInfo(packingOrder.orderId);
  }

  @ResolveField(() => ShipmentInfo, { nullable: true })
  async shipmentInfo(@Parent() packingOrder: any): Promise<any> {
    return this.packingService.getShipmentInfo(packingOrder.orderId);
  }

  /**
   * The packingOrder.orderId field stores the linked Order's MongoDB _id (ObjectId string),
   * NOT the custom 'ORD_xxx' orderId string.
   * So we must first try findByInternalId (by _id), then fall back to findById (by orderId string).
   */
  private async findLinkedOrder(packingOrder: any) {
    const ref = packingOrder.orderId as string;
    if (!ref) return null;
    // Primary: treat as MongoDB ObjectId
    if (Types.ObjectId.isValid(ref)) {
      const order = await this.orderRepository.findByInternalId(ref);
      if (order) return order;
    }
    // Fallback: treat as custom orderId string (ORD_xxx)
    return this.orderRepository.findById(ref);
  }

  @ResolveField(() => String, { nullable: true })
  async boxId(@Parent() packingOrder: any): Promise<string | null> {
    const order = await this.findLinkedOrder(packingOrder);
    return order?.boxId?.toString() || null;
  }

  @ResolveField(() => Float, { nullable: true })
  async volumetricWeight(@Parent() packingOrder: any): Promise<number | null> {
    const order = await this.findLinkedOrder(packingOrder);
    return order?.volumetricWeight || null;
  }

  @ResolveField(() => String, { nullable: true })
  async region(@Parent() packingOrder: any): Promise<string | null> {
    const order = await this.findLinkedOrder(packingOrder);
    return order?.region || null;
  }

  @ResolveField(() => Float, { nullable: true })
  async logisticsCost(@Parent() packingOrder: any): Promise<number | null> {
    const order = await this.findLinkedOrder(packingOrder);
    return order?.logisticsCost || null;
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
  async markItemShort(
    @Args('packingOrderId') packingOrderId: string,
    @Args('productId') productId: string,
    @Args('shortQty', { type: () => Int }) shortQty: number,
    @Args('isComponent', { type: () => Boolean, nullable: true }) isComponent: boolean,
    @Context() ctx,
  ): Promise<any> {
    return this.packingService.markItemShort(
      packingOrderId,
      productId,
      shortQty,
      ctx.req.user.packerId,
      isComponent,
    );
  }

  @Mutation(() => PackingOrder)
  @UseGuards(PackerAuthGuard, RolesGuard)
  @Roles(Role.PACKER)
  async uploadEvidence(
    @Args('input', { type: () => UploadEvidenceInput })
    input: UploadEvidenceInput,
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
    @Args('provider', { nullable: true }) provider: string,
    @Args('serviceType', { nullable: true }) serviceType: string,
    @Context() ctx,
  ): Promise<any> {
    return this.packingService.completePacking(
      packingOrderId,
      ctx.req.user.packerId,
      provider,
      serviceType,
    );
  }

  @Query(() => DeliveryRecommendation)
  @UseGuards(PackerAuthGuard, RolesGuard)
  @Roles(Role.PACKER, Role.ADMIN)
  async getDeliveryRecommendation(
    @Args('orderId') orderId: string,
  ): Promise<any> {
    return this.packingService.getDeliveryRecommendation(orderId);
  }

  @Mutation(() => PackingOrder)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PACKER)
  async adminPunchShipment(
    @Args('input') input: AdminPunchShipmentInput,
  ): Promise<any> {
    return this.packingService.adminPunchShipment(input);
  }

  @Query(() => [PackingOrder])
  @UseGuards(PackerAuthGuard, RolesGuard)
  @Roles(Role.PACKER, Role.ADMIN)
  async getMyOrderHistory(@Context() ctx): Promise<any[]> {
    return this.packingService.getPackerHistory(ctx.req.user.packerId);
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

  @Query(() => PackingOrder)
  @UseGuards(JwtAuthGuard)
  async getPackingOrder(@Args('id') id: string): Promise<any> {
    return this.packingService.getPackingOrderById(id);
  }

  @Query(() => PackingEvidence)
  @UseGuards(PackerAuthGuard, RolesGuard)
  @Roles(Role.PACKER, Role.ADMIN)
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

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async triggerReassignmentCycle(): Promise<boolean> {
    await this.packingQueueService.processReassignment();
    return true;
  }
}

@Resolver(() => ScanLog)
export class ScanLogResolver {
  @ResolveField(() => ID)
  id(@Parent() scanLog: any): string {
    return scanLog._id?.toString() || scanLog.id;
  }
}
