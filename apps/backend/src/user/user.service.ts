import { Injectable } from '@nestjs/common';
import { User } from './user.schema';
import { GetCustomersInput } from './user.input';
import { PaginatedCustomersResponse, CustomerDetails } from './user.graphql';
import { UserCrudService, CreateUserData } from './services/user-crud.service';
import { CustomerQueryService } from './services/customer-query.service';
import { CustomerStatsService } from './services/customer-stats.service';
import { CustomerEnrichmentService } from './services/customer-enrichment.service';
import { CustomerDetailsService } from './services/customer-details.service';
import { UserActivityService } from './services/user-activity.service';
import { PaginationService } from './services/pagination.service';

@Injectable()
export class UserService {
  constructor(
    private userCrudService: UserCrudService,
    private customerQueryService: CustomerQueryService,
    private customerStatsService: CustomerStatsService,
    private customerEnrichmentService: CustomerEnrichmentService,
    private customerDetailsService: CustomerDetailsService,
    private userActivityService: UserActivityService,
    private paginationService: PaginationService,
  ) { }

  async createUser(data: CreateUserData): Promise<User> {
    return this.userCrudService.createUser(data);
  }

  async findById(id: string): Promise<User | null> {
    return this.userCrudService.findById(id);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.userCrudService.findByPhoneNumber(phoneNumber);
  }

  async addMergedGuestId(userId: string, guestId: string): Promise<void> {
    return this.userCrudService.addMergedGuestId(userId, guestId);
  }

  async getAllCustomers(
    input: GetCustomersInput,
  ): Promise<PaginatedCustomersResponse> {
    const filter = this.customerQueryService.buildCustomerFilter(input);
    const page = input.page || 1;
    const limit = input.limit || 10;
    const skip = (page - 1) * limit;

    const [allCustomers, summary] = await Promise.all([
      this.customerQueryService.fetchAllCustomers(filter),
      this.customerStatsService.getCustomerSummary(),
    ]);

    let enrichedCustomers =
      await this.customerEnrichmentService.enrichCustomersWithOrderData(
        allCustomers,
      );

    enrichedCustomers = this.customerQueryService.applySpendingFilter(
      enrichedCustomers,
      input,
    );
    enrichedCustomers = this.customerEnrichmentService.applyCartStatusFilter(
      enrichedCustomers,
      input.cartStatus,
    );
    enrichedCustomers = this.customerQueryService.applySorting(
      enrichedCustomers,
      input,
    );

    const totalCount = enrichedCustomers.length;
    const paginatedCustomers = enrichedCustomers.slice(skip, skip + limit);

    const meta = this.paginationService.buildPaginationMeta(
      totalCount,
      page,
      limit,
    );

    return { customers: paginatedCustomers, meta, summary };
  }

  async getCustomerDetails(id: string): Promise<CustomerDetails> {
    return this.customerDetailsService.getCustomerDetails(id);
  }

  async updateUserActivity(userId: string): Promise<boolean> {
    return this.userActivityService.updateUserActivity(userId);
  }

  async updateUser(userId: string, input: any): Promise<User> {
    return this.userCrudService.updateUser(userId, input);
  }
}
