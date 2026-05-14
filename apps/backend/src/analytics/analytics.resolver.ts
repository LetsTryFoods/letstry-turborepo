import { Resolver, Query } from '@nestjs/graphql';
import { AnalyticsService } from './analytics.service';
import { QRAnalyticsSummary } from './analytics.schema';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Resolver()
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Query(() => QRAnalyticsSummary, { name: 'qrAnalytics' })
  @Roles(Role.ADMIN)
  async getQrAnalytics(): Promise<QRAnalyticsSummary> {
    return this.analyticsService.getAnalyticsSummary();
  }
}
