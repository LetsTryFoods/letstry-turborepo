import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { DataExportService, ExportColumn } from './data-export.service';
import { JwtAuthGuard } from '../authentication/common/jwt-auth.guard';
import { UserService } from '../user/user.service';
import { CustomerSortField, SortOrder } from '../user/user.input';
import { ContactService } from '../contact/services/contact.service';

@Controller('data-export')
@UseGuards(JwtAuthGuard)
export class DataExportController {
  constructor(
    private readonly dataExportService: DataExportService,
    private readonly userService: UserService,
    private readonly contactService: ContactService,
  ) {}

  @Post('excel')
  async exportExcel(
    @Body('data') data: any[],
    @Body('columns') columns: ExportColumn[],
    @Body('fileName') fileName: string,
    @Res() res: Response,
  ) {
    return this.dataExportService.exportToExcel(res, data, columns, fileName);
  }

  @Post('csv')
  async exportCsv(
    @Body('data') data: any[],
    @Body('columns') columns: ExportColumn[],
    @Body('fileName') fileName: string,
    @Res() res: Response,
  ) {
    return this.dataExportService.exportToCsv(res, data, columns, fileName);
  }

  @Post('customers/excel')
  async exportCustomersExcel(
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
    @Res() res: Response,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (
      Number.isNaN(parsedStartDate.getTime()) ||
      Number.isNaN(parsedEndDate.getTime())
    ) {
      throw new BadRequestException('Invalid date range');
    }

    if (parsedStartDate > parsedEndDate) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    const customers = await this.userService.getCustomersForExport({
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      sortBy: CustomerSortField.CREATED_AT,
      sortOrder: SortOrder.DESC,
    });

    const columns: ExportColumn[] = [
      { key: '_id', label: 'Customer ID' },
      { key: 'identityId', label: 'Identity ID' },
      { key: 'fullName', label: 'Customer Name' },
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'displayPhone', label: 'Phone' },
      { key: 'status', label: 'Status' },
      { key: 'role', label: 'Role' },
      { key: 'isGuest', label: 'Guest User' },
      { key: 'isPhoneVerified', label: 'Phone Verified' },
      { key: 'isEmailVerified', label: 'Email Verified' },
      { key: 'totalOrders', label: 'Total Orders' },
      { key: 'totalSpent', label: 'Total Spent' },
      { key: 'activeCartItemsCount', label: 'Active Cart Items' },
      { key: 'lifetimeValue', label: 'Lifetime Value' },
      { key: 'marketingSmsOptIn', label: 'Marketing SMS Opt In' },
      { key: 'registeredAt', label: 'Registered At' },
      { key: 'lastLoginAt', label: 'Last Login At' },
      { key: 'lastActiveAt', label: 'Last Active At' },
      { key: 'createdAt', label: 'Created At' },
      { key: 'updatedAt', label: 'Updated At' },
      { key: 'signupSourceText', label: 'Signup Source' },
      { key: 'deviceInfoText', label: 'Device Info' },
      { key: 'ipAddress', label: 'IP Address' },
      { key: 'lastIp', label: 'Last IP' },
      { key: 'firstAuthMethod', label: 'First Auth Method' },
      { key: 'lastAuthMethod', label: 'Last Auth Method' },
      { key: 'mergedGuestIdsText', label: 'Merged Guest IDs' },
    ];

    return this.dataExportService.exportToExcel(
      res,
      customers,
      columns,
      'customers-export',
    );
  }

  @Post('contacts/excel')
  async exportContactsExcel(
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
    @Res() res: Response,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (
      Number.isNaN(parsedStartDate.getTime()) ||
      Number.isNaN(parsedEndDate.getTime())
    ) {
      throw new BadRequestException('Invalid date range');
    }

    if (parsedStartDate > parsedEndDate) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    const contacts = await this.contactService.findAllForExport({
      createdAt: {
        $gte: parsedStartDate,
        $lte: parsedEndDate,
      },
    });

    const columns: ExportColumn[] = [
      { key: '_id', label: 'Query ID' },
      { key: 'name', label: 'Customer Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'orderId', label: 'Order ID' },
      { key: 'queryType', label: 'Query Type' },
      { key: 'message', label: 'Message' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Created At' },
      { key: 'updatedAt', label: 'Updated At' },
    ];

    return this.dataExportService.exportToExcel(
      res,
      contacts,
      columns,
      'contact-queries-export',
    );
  }
}
