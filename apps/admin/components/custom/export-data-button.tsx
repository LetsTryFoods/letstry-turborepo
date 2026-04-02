import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/axios';

/**
 * Interface for column definitions
 */
export interface ExportColumn {
  key: string;
  label: string;
}

interface ExportDataButtonProps {
  /**
   * Function to fetch data when the button is clicked.
   */
  fetchData?: () => Promise<any[]>;
  /**
   * Static data to export if 'fetchData' is not provided.
   */
  data?: any[];
  /**
   * Column definitions (key and label)
   */
  columns: ExportColumn[];
  /**
   * Name of the file (without extension)
   */
  fileName?: string;
  /**
   * Format of the file ('xlsx' or 'csv')
   */
  format?: 'xlsx' | 'csv';
  /**
   * Text to display on the button
   */
  buttonText?: string;
  /**
   * Variant of the button (from shadcn UI)
   */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  /**
   * Size of the button
   */
  size?: "default" | "sm" | "lg" | "icon";
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const ExportDataButton: React.FC<ExportDataButtonProps> = ({
  fetchData,
  data: staticData,
  columns,
  fileName = 'export',
  format = 'xlsx',
  buttonText = 'Export Data',
  variant = 'outline',
  size = 'default',
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    try {
      setIsLoading(true);
      
      let dataToExport = staticData;
      
      if (fetchData) {
        dataToExport = await fetchData();
      }
      
      if (!dataToExport || dataToExport.length === 0) {
        toast.error('No data found to export');
        return;
      }

      // Call backend to generate the file
      const response = await api.post(`/data-export/${format}`, {
        data: dataToExport,
        columns,
        fileName,
      }, {
        responseType: 'blob',
      });

      // Create a link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const extension = format === 'csv' ? 'csv' : 'xlsx';
      const timestamp = new Date().getTime();
      link.setAttribute('download', `${fileName}_${timestamp}.${extension}`);
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Data exported to ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data. Please ensure the backend is running and you are logged in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {isLoading ? 'Exporting...' : buttonText}
    </Button>
  );
};
