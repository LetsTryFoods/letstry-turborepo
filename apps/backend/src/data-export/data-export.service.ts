import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

export interface ExportColumn {
  key: string;
  label: string;
}

@Injectable()
export class DataExportService {
  /**
   * Resolves nested object paths (e.g., "categories[0].name")
   */
  private resolvePath(path: string, obj: any) {
    if (!path || !obj) return undefined;
    return path.split(/[.[\]]/).filter(Boolean).reduce((prev, curr) => {
      return prev ? prev[curr] : undefined;
    }, obj);
  }

  /**
   * Formats a value for display in Excel/CSV
   */
  private formatValue(value: any) {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
      return value.map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ');
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (value === null || value === undefined) {
      return '-';
    }
    return value;
  }

  /**
   * Generates an Excel file and pipes it to the response
   */
  async exportToExcel(
    res: Response,
    data: any[],
    columns: ExportColumn[],
    fileName: string = 'export',
  ) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    // Add headers
    worksheet.columns = columns.map(col => ({
      header: col.label,
      key: col.key,
      width: 20,
    }));

    // Add rows
    data.forEach(item => {
      const rowData: any = {};
      columns.forEach(col => {
        const rawValue = this.resolvePath(col.key, item);
        rowData[col.key] = this.formatValue(rawValue);
      });
      worksheet.addRow(rowData);
    });

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Set response headers
    const finalFileName = `${fileName}_${Date.now()}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${finalFileName}`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  /**
   * Generates a CSV file and pipes it to the response
   */
  async exportToCsv(
    res: Response,
    data: any[],
    columns: ExportColumn[],
    fileName: string = 'export',
  ) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    worksheet.columns = columns.map(col => ({
      header: col.label,
      key: col.key,
    }));

    data.forEach(item => {
      const rowData: any = {};
      columns.forEach(col => {
        const rawValue = this.resolvePath(col.key, item);
        rowData[col.key] = this.formatValue(rawValue);
      });
      worksheet.addRow(rowData);
    });

    const finalFileName = `${fileName}_${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${finalFileName}`,
    );

    await workbook.csv.write(res);
    res.end();
  }
}
