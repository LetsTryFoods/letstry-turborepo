import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { DataExportService, ExportColumn } from './data-export.service';
import { JwtAuthGuard } from '../authentication/common/jwt-auth.guard';

@Controller('data-export')
@UseGuards(JwtAuthGuard)
export class DataExportController {
  constructor(private readonly dataExportService: DataExportService) {}

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
}
