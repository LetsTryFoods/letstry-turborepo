import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { LogisticsAnalyticsService } from './services/logistics-analytics.service';
import {
  GetMyOrdersInput,
  CancelOrderInput,
  GetAllOrdersInput,
  UpdateOrderStatusInput,
  AssignBoxToOrderInput,
} from './order.input';
import {
  OrderType,
  PaginatedOrdersResponse,
  AdminOrdersResponse,
  OrderPaymentType,
  OrderShippingAddressType,
  OrderCustomerType,
  OrderWithUserInfo,
  BoxDimensionType,
} from './order.graphql';
import { LogisticsAnalyticsResponse } from './logistics-analytics.graphql';
import {
  OrderReportResponse,
  ShippingInsightsType,
  StateSalesType,
} from './order-report.graphql';
import { DualAuthGuard } from '../authentication/common/dual-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { OptionalUser } from '../common/decorators/optional-user.decorator';
import { PackingService } from '../packing/services/packing.service';
import { ShipmentService } from '../shipment/services/shipment.service';
import {
  ShipmentResponse,
  ShipmentWithTrackingResponse,
} from '../shipment/dto/shipment-response.dto';
import { MobileAppGuard } from '../common/guards/mobile-app.guard';

import { Public } from '../common/decorators/public.decorator';

@Resolver(() => OrderType)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    private readonly packingService: PackingService,
    private readonly shipmentService: ShipmentService,
    private readonly logisticsAnalyticsService: LogisticsAnalyticsService,
  ) {}

  @Query(() => LogisticsAnalyticsResponse)
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getMonthlyLogisticsAnalytics(
    @Args('month', { type: () => Number }) month: number,
    @Args('year', { type: () => Number }) year: number,
  ): Promise<LogisticsAnalyticsResponse> {
    return this.logisticsAnalyticsService.getMonthlyAnalytics(month, year);
  }

  @Query(() => OrderReportResponse)
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getOrderReports(
    @Args('period', { type: () => String, defaultValue: 'month' })
    period: string,
  ): Promise<OrderReportResponse> {
    return this.orderService.getOrderReports(period);
  }

  @Query(() => ShippingInsightsType)
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getShippingInsights(): Promise<ShippingInsightsType> {
    const insights = await this.orderService.getShippingInsights();

    // The user requested to compute the most used box based on admin panel recommendations
    // If it's not present from packingevidences, or we just want to enforce the recommended one
    if (!insights.mostUsedBox) {
      insights.mostUsedBox =
        (await this.packingService.getMostUsedRecommendedBox()) ?? undefined;
    }

    if (insights.mostUsedBox && !insights.mostUsedBox.includes('(')) {
      const boxDetails = await this.packingService.getBoxByCode(
        insights.mostUsedBox,
      );
      if (boxDetails?.internalDimensions) {
        const dims = boxDetails.internalDimensions;
        insights.mostUsedBox = `${insights.mostUsedBox} (${dims.l}x${dims.w}x${dims.h} cm)`;
      }
    }

    return insights;
  }

  @Query(() => [StateSalesType])
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getSalesByState(
    @Args('period', { type: () => String, defaultValue: 'month' })
    period: string,
  ): Promise<StateSalesType[]> {
    return this.orderService.getSalesByState(period);
  }

  @Query(() => PaginatedOrdersResponse)
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(DualAuthGuard, RolesGuard)
  async getMyOrders(
    @Args('input') input: GetMyOrdersInput,
    @OptionalUser() user: any,
  ): Promise<any> {
    if (!user?._id) {
      throw new Error('User identification required');
    }

    if (user.isGuest || user.role === Role.GUEST) {
      throw new Error(
        'Guest users cannot access orders. Please log in to view your orders.',
      );
    }

    const mergedGuestIds = user.mergedGuestIds || [];

    const result = await this.orderService.getOrdersByIdentity({
      identityId: user._id,
      mergedGuestIds,
      userPhone: user.phone,
      page: input.page,
      limit: input.limit,
      status: input.status,
    });

    return {
      ...result,
      orders: result.orders.map((o) => (o.toObject ? o.toObject() : o)),
    };
  }

  /**
   * Guest-only order query — mobile app exclusive.
   * Protected by MobileAppGuard (x-mobile-key header).
   * No JWT required: uses the guest session identity resolved by DualAuthGuard.
   */
  @Query(() => PaginatedOrdersResponse)
  @Public()
  @UseGuards(DualAuthGuard, MobileAppGuard)
  async getGuestOrders(
    @Args('input') input: GetMyOrdersInput,
    @OptionalUser() user: any,
  ): Promise<any> {
    // Must have a guest identity resolved via x-session-id
    if (!user?._id) {
      throw new Error('Guest session not found. Please restart the app.');
    }

    if (!user.isGuest && user.role !== Role.GUEST) {
      throw new Error('This endpoint is for guest users only.');
    }

    const result = await this.orderService.getOrdersByIdentity({
      identityId: user._id,
      mergedGuestIds: [],
      page: input.page,
      limit: input.limit,
      status: input.status,
    });

    return {
      ...result,
      orders: result.orders.map((o) => (o.toObject ? o.toObject() : o)),
    };
  }

  /**
   * Guest-only order by ID query — mobile app exclusive.
   */
  @Query(() => OrderType)
  @Public()
  @UseGuards(DualAuthGuard, MobileAppGuard)
  async getGuestOrderById(
    @Args('orderId') orderId: string,
    @OptionalUser() user: any,
  ): Promise<any> {
    if (!user?._id) {
      throw new Error('Guest session not found. Please restart the app.');
    }

    if (!user.isGuest && user.role !== Role.GUEST) {
      throw new Error('This endpoint is for guest users only.');
    }

    const order = await this.orderService.getOrderById(orderId);

    // Add ownership check
    if (
      order.identityId?.toString() !== user._id.toString() &&
      !user.mergedGuestIds?.includes(order.identityId?.toString())
    ) {
      throw new Error('Unauthorized to access this order.');
    }

    return order.toObject ? order.toObject() : order;
  }

  /**
   * Guest-only shipment tracking query — mobile app exclusive.
   */
  @Query(() => ShipmentWithTrackingResponse)
  @Public()
  @UseGuards(DualAuthGuard, MobileAppGuard)
  async getGuestShipmentWithTracking(
    @Args('awbNumber') awbNumber: string,
    @OptionalUser() user: any,
  ): Promise<ShipmentWithTrackingResponse> {
    if (!user?._id) {
      throw new Error('Guest session not found. Please restart the app.');
    }

    if (!user.isGuest && user.role !== Role.GUEST) {
      throw new Error('This endpoint is for guest users only.');
    }

    const result =
      await this.shipmentService.getShipmentWithTracking(awbNumber);

    // Check if the shipment belongs to an order owned by this guest
    const order = await this.orderService.getOrderById(
      result.shipment.orderId.toString(),
    );
    if (
      order.identityId?.toString() !== user._id.toString() &&
      !user.mergedGuestIds?.includes(order.identityId?.toString())
    ) {
      throw new Error('Unauthorized to access this tracking info.');
    }

    return {
      ...(result.shipment.toObject() as any),
      id: result.shipment._id.toString(),
      orderId: result.shipment.orderId?.toString(),
      trackingLink: `https://letstryfoods.com/track/${result.shipment.awbNumber || result.shipment.dtdcAwbNumber}`,
      trackingHistory: result.tracking.map((t) => ({
        ...(t.toObject() as any),
        id: t._id.toString(),
      })),
    };
  }

  @Query(() => AdminOrdersResponse)
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async getAllOrders(
    @Args('input') input: GetAllOrdersInput,
  ): Promise<AdminOrdersResponse> {
    return this.orderService.getAllOrdersForAdmin(input);
  }

  @Query(() => OrderType)
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(DualAuthGuard, RolesGuard)
  async getOrderById(
    @Args('orderId') orderId: string,
    @OptionalUser() user: any,
  ): Promise<any> {
    if (!user?._id) {
      throw new Error('User identification required');
    }

    if (user.isGuest || user.role === Role.GUEST) {
      throw new Error(
        'Guest users cannot access orders. Please log in to view order details.',
      );
    }

    const order = await this.orderService.getOrderById(orderId);
    return order.toObject ? order.toObject() : order;
  }

  @Mutation(() => OrderType)
  @Roles(Role.ADMIN, Role.USER)
  @UseGuards(DualAuthGuard, RolesGuard)
  async cancelOrder(
    @Args('input') input: CancelOrderInput,
    @OptionalUser() user: any,
  ): Promise<any> {
    if (!user?._id) {
      throw new Error('User identification required');
    }

    if (user.isGuest || user.role === Role.GUEST) {
      throw new Error(
        'Guest users cannot cancel orders. Please log in to manage your orders.',
      );
    }

    const order = await this.orderService.cancelOrder({
      orderId: input.orderId,
      reason: input.reason || 'Cancelled by user',
    });
    return order.toObject ? order.toObject() : order;
  }

  @Mutation(() => OrderType)
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  async updateOrderStatus(
    @Args('input') input: UpdateOrderStatusInput,
  ): Promise<any> {
    const order = await this.orderService.updateOrderStatus({
      orderId: input.orderId,
      status: input.status,
      trackingNumber: input.trackingNumber,
    });
    return order.toObject ? order.toObject() : order;
  }

  @Mutation(() => OrderType)
  @Roles(Role.ADMIN, Role.USER, Role.PACKER)
  @UseGuards(DualAuthGuard, RolesGuard)
  async assignBoxToOrder(
    @Args('input') input: AssignBoxToOrderInput,
  ): Promise<any> {
    const order = await this.orderService.assignBoxToOrder({
      orderId: input.orderId,
      boxId: input.boxId,
    });
    return order.toObject ? order.toObject() : order;
  }

  @ResolveField(() => OrderPaymentType, { nullable: true })
  async payment(@Parent() order: any): Promise<OrderPaymentType | null> {
    return this.orderService.resolvePayment(order);
  }

  @ResolveField(() => OrderShippingAddressType, { nullable: true })
  async shippingAddress(
    @Parent() order: any,
  ): Promise<OrderShippingAddressType | null> {
    return this.orderService.resolveShippingAddress(order);
  }

  @ResolveField(() => OrderCustomerType, { nullable: true })
  async customer(@Parent() order: any): Promise<OrderCustomerType | null> {
    return this.orderService.resolveCustomer(order);
  }

  @ResolveField('items')
  async items(@Parent() order: any): Promise<any[]> {
    return this.orderService.resolveItems(order);
  }

  @ResolveField('estimatedWeight', () => Number, { nullable: true })
  async estimatedWeight(@Parent() order: any): Promise<number | null> {
    const details = await this.packingService.getPackingDetailsByOrderId(
      order.orderId,
    );
    if (details) {
      return (
        (
          await this.packingService.calculateShipmentWeight(
            order,
            details.packingOrder,
            details.evidence,
          )
        )?.weight || null
      );
    }
    return (
      (await this.packingService.calculateWeightAndBoxFromOrder(order))
        ?.weight || null
    );
  }

  @ResolveField('boxDimensions', () => BoxDimensionType, { nullable: true })
  async boxDimensions(@Parent() order: any): Promise<BoxDimensionType | null> {
    const details = await this.packingService.getPackingDetailsByOrderId(
      order.orderId,
    );
    if (details) {
      return (
        (
          await this.packingService.calculateShipmentWeight(
            order,
            details.packingOrder,
            details.evidence,
          )
        )?.boxDimensions || null
      );
    }
    return (
      (await this.packingService.calculateWeightAndBoxFromOrder(order))
        ?.boxDimensions || null
    );
  }
}

@Resolver(() => OrderWithUserInfo)
export class OrderWithUserInfoResolver {
  constructor(
    private readonly orderService: OrderService,
    private readonly packingService: PackingService,
    private readonly shipmentService: ShipmentService,
  ) {}

  @ResolveField(() => OrderPaymentType, { nullable: true })
  async payment(@Parent() order: any): Promise<OrderPaymentType | null> {
    return this.orderService.resolvePayment(order);
  }

  @ResolveField(() => OrderShippingAddressType, { nullable: true })
  async shippingAddress(
    @Parent() order: any,
  ): Promise<OrderShippingAddressType | null> {
    return this.orderService.resolveShippingAddress(order);
  }

  @ResolveField(() => OrderCustomerType, { nullable: true })
  async customer(@Parent() order: any): Promise<OrderCustomerType | null> {
    return this.orderService.resolveCustomer(order);
  }

  @ResolveField('items')
  async items(@Parent() order: any): Promise<any[]> {
    return this.orderService.resolveItems(order);
  }

  @ResolveField('estimatedWeight', () => Number, { nullable: true })
  async estimatedWeight(@Parent() order: any): Promise<number | null> {
    const details = await this.packingService.getPackingDetailsByOrderId(
      order.orderId,
    );
    if (details) {
      return (
        (
          await this.packingService.calculateShipmentWeight(
            order,
            details.packingOrder,
            details.evidence,
          )
        )?.weight || null
      );
    }
    return (
      (await this.packingService.calculateWeightAndBoxFromOrder(order))
        ?.weight || null
    );
  }

  @ResolveField('boxDimensions', () => BoxDimensionType, { nullable: true })
  async boxDimensions(@Parent() order: any): Promise<BoxDimensionType | null> {
    const details = await this.packingService.getPackingDetailsByOrderId(
      order.orderId,
    );
    if (details) {
      return (
        (
          await this.packingService.calculateShipmentWeight(
            order,
            details.packingOrder,
            details.evidence,
          )
        )?.boxDimensions || null
      );
    }
    return (
      (await this.packingService.calculateWeightAndBoxFromOrder(order))
        ?.boxDimensions || null
    );
  }

  @ResolveField(() => ShipmentResponse, { nullable: true })
  async shipment(@Parent() order: any): Promise<ShipmentResponse | null> {
    const shipments = await this.shipmentService.findByOrderId(
      order._id.toString(),
    );
    return shipments.length > 0
      ? (shipments[0] as any as ShipmentResponse)
      : null;
  }
}
