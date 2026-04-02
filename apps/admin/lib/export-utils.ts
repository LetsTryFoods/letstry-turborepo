import * as XLSX from 'xlsx';

/**
 * Interface for column definitions
 */
export interface ExportColumn {
  key: string;
  label: string;
}

/**
 * Resolves nested object paths (e.g., "categories[0].name")
 */
const resolvePath = (path: string, obj: any) => {
  return path.split(/[.[\]]/).filter(Boolean).reduce((prev, curr) => {
    return prev ? prev[curr] : undefined;
  }, obj);
};

/**
 * Exports data to an Excel or CSV file
 * 
 * @param data - Array of objects to export
 * @param columns - Mapping of data keys to Excel headers
 * @param fileName - Name of the file (without extension)
 * @param format - 'xlsx' or 'csv'
 * @param sheetName - Name of the Excel sheet
 */
export const exportData = ({
  data,
  columns,
  fileName = 'export',
  format = 'xlsx',
  sheetName = 'Data'
}: {
  data: any[];
  columns: ExportColumn[];
  fileName?: string;
  format?: 'xlsx' | 'csv';
  sheetName?: string;
}) => {
  // Transform data based on column mapping
  const transformedData = data.map(item => {
    const row: Record<string, any> = {};
    columns.forEach(col => {
      let value = resolvePath(col.key, item);
      
      // Handle special types (e.g., boolean, arrays)
      if (typeof value === 'boolean') {
        value = value ? 'Yes' : 'No';
      } else if (Array.isArray(value)) {
        value = value.join(', ');
      } else if (value === null || value === undefined) {
        value = '-';
      }
      
      row[col.label] = value;
    });
    return row;
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(transformedData);

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Trigger download
  const fullFileName = `${fileName}_${new Date().getTime()}.${format}`;
  
  if (format === 'csv') {
    XLSX.writeFile(workbook, fullFileName, { bookType: 'csv' });
  } else {
    XLSX.writeFile(workbook, fullFileName, { bookType: 'xlsx' });
  }
};
