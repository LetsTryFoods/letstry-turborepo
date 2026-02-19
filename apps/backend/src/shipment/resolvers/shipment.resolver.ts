import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ShipmentService } from '../services/shipment.service';
import { TrackingService } from '../services/tracking.service';
import { JwtAuthGuard } from '../../authentication/common/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateShipmentInput } from '../dto/create-shipment.dto';
import { ShipmentFiltersInput } from '../dto/shipment-filters.dto';
import { CancelShipmentInput } from '../dto/cancel-shipment.dto';
import { ShipmentAddressInput } from '../dto/shipment-address.input';
import {
  ShipmentResponse,
  ShipmentListResponse,
  ShipmentWithTrackingResponse,
  CreateShipmentResponse,
} from '../dto/shipment-response.dto';

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ShipmentResolver {
  constructor(
    private readonly shipmentService: ShipmentService,
    private readonly trackingService: TrackingService,
  ) { }

  @Mutation(() => CreateShipmentResponse)
  async createShipment(@Args('input') input: CreateShipmentInput): Promise<CreateShipmentResponse> {
    const result = await this.shipmentService.createShipment({
      orderId: input.orderId,
      serviceType: input.serviceType,
      loadType: input.loadType,
      weight: input.weight,
      declaredValue: input.declaredValue,
      numPieces: input.numPieces,
      dimensions: {
        length: input.dimensions.length,
        width: input.dimensions.width,
        height: input.dimensions.height,
      },
      originDetails: {
        name: input.originDetails.name,
        phone: input.originDetails.phone,
        alternatePhone: input.originDetails.alternatePhone,
        addressLine1: input.originDetails.addressLine1,
        addressLine2: input.originDetails.addressLine2,
        pincode: input.originDetails.pincode,
        city: input.originDetails.city,
        state: input.originDetails.state,
        latitude: input.originDetails.latitude,
        longitude: input.originDetails.longitude,
      },
      destinationDetails: {
        name: input.destinationDetails.name,
        phone: input.destinationDetails.phone,
        alternatePhone: input.destinationDetails.alternatePhone,
        addressLine1: input.destinationDetails.addressLine1,
        addressLine2: input.destinationDetails.addressLine2,
        pincode: input.destinationDetails.pincode,
        city: input.destinationDetails.city,
        state: input.destinationDetails.state,
        latitude: input.destinationDetails.latitude,
        longitude: input.destinationDetails.longitude,
      },
      codAmount: input.codAmount,
      codCollectionMode: input.codCollectionMode,
      invoiceNumber: input.invoiceNumber,
      invoiceDate: input.invoiceDate ? new Date(input.invoiceDate) : undefined,
      ewayBill: input.ewayBill,
      commodityId: input.commodityId,
      description: input.description,
      piecesDetail: input.piecesDetail?.map((piece) => ({
        description: piece.description,
        declaredValue: piece.declaredValue,
        weight: piece.weight,
        height: piece.height,
        length: piece.length,
        width: piece.width,
      })),
    });

    return {
      success: true,
      shipment: {
        ...(result.shipment.toObject() as any),
        id: result.shipment._id.toString(),
        orderId: result.shipment.orderId?.toString(),
      },
      awbNumber: result.awbNumber,
      labelUrl: result.labelUrl,
      trackingLink: `https://www.dtdc.in/tracking/shipment-tracking.html?cnno=${result.awbNumber}`,
    };
  }

  @Query(() => ShipmentResponse, { nullable: true })
  async getShipmentByAwb(@Args('awbNumber') awbNumber: string): Promise<ShipmentResponse | null> {
    const shipment = await this.shipmentService.findByAwbNumber(awbNumber);

    if (!shipment) {
      return null;
    }

    const obj = shipment.toObject() as any;
    return {
      ...obj,
      id: shipment._id.toString(),
      orderId: shipment.orderId?.toString(),
    };
  }

  @Query(() => ShipmentResponse, { nullable: true })
  async getShipmentById(@Args('id', { type: () => ID }) id: string): Promise<ShipmentResponse | null> {
    const shipment = await this.shipmentService.findById(id);

    if (!shipment) {
      return null;
    }

    const obj = shipment.toObject() as any;
    return {
      ...obj,
      id: shipment._id.toString(),
      orderId: shipment.orderId?.toString(),
    };
  }

  @Query(() => ShipmentListResponse)
  async listShipments(@Args('filters', { nullable: true }) filters?: ShipmentFiltersInput): Promise<ShipmentListResponse> {
    const shipments = await this.shipmentService.listShipments({
      orderId: filters?.orderId,
      customerCode: filters?.customerCode,
      statusCode: filters?.statusCode,
      isDelivered: filters?.isDelivered,
      isCancelled: filters?.isCancelled,
      awbNumber: filters?.awbNumber,
      referenceNumber: filters?.referenceNumber,
      bookedFrom: filters?.bookedFrom ? new Date(filters.bookedFrom) : undefined,
      bookedTo: filters?.bookedTo ? new Date(filters.bookedTo) : undefined,
    });

    return {
      success: true,
      shipments: shipments.map((s) => ({
        ...(s.toObject() as any),
        id: s._id.toString(),
        orderId: s.orderId?.toString(),
        trackingLink: `https://www.dtdc.in/tracking/shipment-tracking.html?cnno=${s.dtdcAwbNumber}`,
      })),
      total: shipments.length,
    };
  }

  @Query(() => ShipmentWithTrackingResponse)
  async getShipmentWithTracking(@Args('awbNumber') awbNumber: string): Promise<ShipmentWithTrackingResponse> {
    const result = await this.shipmentService.getShipmentWithTracking(awbNumber);

    return {
      ...(result.shipment.toObject() as any),
      id: result.shipment._id.toString(),
      orderId: result.shipment.orderId?.toString(),
      trackingLink: `https://www.dtdc.in/tracking/shipment-tracking.html?cnno=${result.shipment.dtdcAwbNumber}`,
      trackingHistory: result.tracking.map((t) => ({
        ...(t.toObject() as any),
        id: t._id.toString(),
      })),
    };
  }

  @Mutation(() => ShipmentResponse)
  async cancelShipment(@Args('input') input: CancelShipmentInput): Promise<ShipmentResponse> {
    const shipment = await this.shipmentService.cancelShipment(input.awbNumber);

    const obj = shipment.toObject() as any;
    return {
      ...obj,
      id: shipment._id.toString(),
      orderId: shipment.orderId?.toString(),
      trackingLink: `https://www.dtdc.in/tracking/shipment-tracking.html?cnno=${shipment.dtdcAwbNumber}`,
    };
  }

  @Query(() => String, { nullable: true })
  async getShipmentLabel(@Args('awbNumber') awbNumber: string): Promise<string | null> {
    const shipment = await this.shipmentService.findByAwbNumber(awbNumber);
    if (!shipment) {
      return null;
    }

    // If labelUrl is already saved and valid, return it.
    // Note: The Label URL from DTDC might be temporary or a direct download link. 
    // If it's a base64 string (data:application/pdf;base64,...), it's good to return directly.
    if (shipment.labelUrl) {
      return shipment.labelUrl;
    }

    // Attempt to fetch if not present (this logic might belong in service, but keeping it simple here or calling service method if it existed alone)
    // Actually shipment.service.createShipment fetches and saves it. 
    // If we want to re-fetch, we can use dtdcApiService directly if we injected it, but better to use a service method.
    // However, existing service methods are `createShipment`, `findBy...`, `updateStatus`.
    // Let's rely on what's in the DB for now as per plan, or maybe we should have exposed a service method to refresh label.
    // For now, I will just return what is in the DB.
    return null;
  }
}
