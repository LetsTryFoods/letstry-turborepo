import { Resolver, Subscription, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../authentication/common/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { TrackingHistoryResponse } from '../dto/tracking-history-response.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ShipmentSubscriptionResolver {
  constructor(private eventEmitter: EventEmitter2) {}
}
