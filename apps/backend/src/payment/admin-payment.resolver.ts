import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminPaymentService } from './services/core/admin-payment.service';
import {
  GetPaymentsListInput,
  InitiateAdminRefundInput,
} from './dto/admin-payment.input';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  PaymentsListResponse,
  PaymentDetailType,
  RefundInitiateResponse,
  PaymentListItemType,
} from './dto/admin-payment.graphql';
import { DualAuthGuard } from '../authentication/common/dual-auth.guard';
import { OptionalUser } from '../common/decorators/optional-user.decorator';

@Resolver()
export class AdminPaymentResolver {
  constructor(private readonly adminPaymentService: AdminPaymentService) {}

  @Query(() => PaymentsListResponse)
  @Roles(Role.ADMIN)
  @UseGuards(DualAuthGuard, RolesGuard)
  async getAdminPaymentsList(
    @Args('input') input: GetPaymentsListInput,
    @OptionalUser() user: any,
  ): Promise<PaymentsListResponse> {
    if (!user?._id) {
      throw new Error('Admin authentication required');
    }

    return this.adminPaymentService.getPaymentsList(input);
  }

  @Query(() => PaymentDetailType)
  @Roles(Role.ADMIN)
  @UseGuards(DualAuthGuard, RolesGuard)
  async getAdminPaymentDetail(
    @Args('paymentOrderId') paymentOrderId: string,
    @OptionalUser() user: any,
  ): Promise<any> {
    if (!user?._id) {
      throw new Error('Admin authentication required');
    }

    return this.adminPaymentService.getPaymentDetail(paymentOrderId);
  }

  @Query(() => [PaymentListItemType])
  @Roles(Role.ADMIN)
  @UseGuards(DualAuthGuard, RolesGuard)
  async getAdminPaymentsByIdentity(
    @Args('identityId') identityId: string,
    @OptionalUser() user: any,
  ): Promise<any[]> {
    if (!user?._id) {
      throw new Error('Admin authentication required');
    }

    return this.adminPaymentService.getPaymentsByIdentity(identityId);
  }

  @Query(() => [PaymentListItemType])
  @Roles(Role.ADMIN)
  @UseGuards(DualAuthGuard, RolesGuard)
  async getAdminPaymentsByOrder(
    @Args('orderId') orderId: string,
    @OptionalUser() user: any,
  ): Promise<any[]> {
    if (!user?._id) {
      throw new Error('Admin authentication required');
    }

    return this.adminPaymentService.getPaymentsByOrder(orderId);
  }

  @Mutation(() => RefundInitiateResponse)
  @Roles(Role.ADMIN)
  @UseGuards(DualAuthGuard, RolesGuard)
  async initiateAdminRefund(
    @Args('input') input: InitiateAdminRefundInput,
    @OptionalUser() user: any,
  ): Promise<RefundInitiateResponse> {
    if (!user?._id) {
      throw new Error('Admin authentication required');
    }

    return this.adminPaymentService.initiateAdminRefund(user._id, input);
  }
}
