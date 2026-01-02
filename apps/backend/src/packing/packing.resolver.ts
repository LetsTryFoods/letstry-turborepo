import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PackingService } from './services/packing.service';
import { PackerAuthGuard } from './guards/packer-auth.guard';
import { ScanItemInput } from './dto/scan-item.input';
import { UploadEvidenceInput } from './dto/upload-evidence.input';
import { PackingOrder } from './types/packing-order.type';
import { ScanLog } from './types/scan-log.type';
import { BoxSize } from '../box-size/types/box-size.type';

@Resolver()
export class PackingResolver {
  constructor(private readonly packingService: PackingService) {}

  @Query(() => PackingOrder)
  @UseGuards(PackerAuthGuard)
  async getAssignedOrder(@Context() ctx): Promise<any> {
    return this.packingService.assignOrderToPacker(ctx.req.user.packerId);
  }

  @Mutation(() => ScanLog)
  @UseGuards(PackerAuthGuard)
  async scanItem(
    @Args('input') input: ScanItemInput,
    @Context() ctx,
  ): Promise<any> {
    return this.packingService.scanItem(
      input.packingOrderId,
      input.ean,
      ctx.req.user.packerId,
    );
  }

  @Mutation(() => PackingOrder)
  @UseGuards(PackerAuthGuard)
  async uploadEvidence(
    @Args('input') input: UploadEvidenceInput,
    @Context() ctx,
  ): Promise<any> {
    return this.packingService.uploadEvidence(
      input.packingOrderId,
      input.prePackImages || [],
      input.actualBoxCode || '',
    );
  }

  @Mutation(() => PackingOrder)
  @UseGuards(PackerAuthGuard)
  async completePacking(
    @Args('packingOrderId') packingOrderId: string,
  ): Promise<any> {
    return this.packingService.completePacking(packingOrderId);
  }

  @Query(() => BoxSize)
  @UseGuards(PackerAuthGuard)
  async getBoxRecommendation(
    @Args('packingOrderId') packingOrderId: string,
  ): Promise<any> {
    return this.packingService.getBoxRecommendation(packingOrderId);
  }
}
