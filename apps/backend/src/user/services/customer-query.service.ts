import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    Identity,
    IdentityDocument,
} from '../../common/schemas/identity.schema';
import { Role } from '../../common/enums/role.enum';
import { GetCustomersInput, CustomerPlatform } from '../user.input';

@Injectable()
export class CustomerQueryService {
    constructor(
        @InjectModel(Identity.name) private identityModel: Model<IdentityDocument>,
    ) { }

    buildCustomerFilter(input: GetCustomersInput): any {
        const filter: any = {
            role: { $in: [Role.USER, Role.GUEST] },
        };

        if (input.status) {
            filter.status = input.status;
        }

        if (input.platform) {
            filter['signupSource.platform'] = input.platform;
        }

        if (input.searchTerm) {
            filter.$or = [
                { phoneNumber: { $regex: input.searchTerm, $options: 'i' } },
                { email: { $regex: input.searchTerm, $options: 'i' } },
                { firstName: { $regex: input.searchTerm, $options: 'i' } },
                { lastName: { $regex: input.searchTerm, $options: 'i' } },
            ];
        }

        if (input.startDate || input.endDate) {
            filter.createdAt = {};
            if (input.startDate) {
                filter.createdAt.$gte = input.startDate;
            }
            if (input.endDate) {
                filter.createdAt.$lte = input.endDate;
            }
        }

        return filter;
    }

    async fetchAllCustomers(filter: any): Promise<IdentityDocument[]> {
        return this.identityModel.find(filter).exec();
    }

    async fetchCustomers(
        filter: any,
        skip: number,
        limit: number,
    ): Promise<IdentityDocument[]> {
        return this.identityModel
            .find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }

    applySpendingFilter(
        customers: any[],
        input: GetCustomersInput,
    ): any[] {
        let filtered = customers;

        if (input.minSpent !== undefined) {
            filtered = filtered.filter((c) => c.totalSpent >= input.minSpent!);
        }

        if (input.maxSpent !== undefined) {
            filtered = filtered.filter((c) => c.totalSpent <= input.maxSpent!);
        }

        return filtered;
    }

    applySorting(customers: any[], input: GetCustomersInput): any[] {
        if (!input.sortBy) {
            return customers.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );
        }

        const order = input.sortOrder === 'ASC' ? 1 : -1;

        return customers.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            switch (input.sortBy) {
                case 'TOTAL_SPENT':
                    aValue = a.totalSpent || 0;
                    bValue = b.totalSpent || 0;
                    break;
                case 'TOTAL_ORDERS':
                    aValue = a.totalOrders || 0;
                    bValue = b.totalOrders || 0;
                    break;
                case 'LAST_ACTIVE':
                    aValue = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
                    bValue = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
                    break;
                case 'CREATED_AT':
                default:
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                    break;
            }

            return (aValue - bValue) * order;
        });
    }

    async countCustomers(filter: any): Promise<number> {
        return this.identityModel.countDocuments(filter).exec();
    }
}
