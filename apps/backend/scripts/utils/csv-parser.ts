import fs from 'fs';
import csv from 'csv-parser';

export interface CSVProduct {
    sku: string;
    name: string;
    oldEan: string;
    newEan: string;
    campaign?: string;
    remarks?: string;
    poReceived?: string;
    oldGst?: string;
    newGst?: string;
    gstChange?: string;
    oldMrp?: string;
    newMrp?: string;
    oldHsn?: string;
    newHsn?: string;
    oldGrammage?: string;
    newGrammage?: string;
    driveLink?: string;
    npiStatus?: string;
}

export const parseCSV = (filePath: string): Promise<CSVProduct[]> => {
    return new Promise((resolve, reject) => {
        const results: CSVProduct[] = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                results.push({
                    sku: data['Sku Code']?.trim(),
                    name: data['Sku Name']?.trim(),
                    oldEan: data['Old EAN']?.trim(),
                    newEan: data['New EAN']?.trim(),
                    campaign: data['Campaign']?.trim(),
                    remarks: data['Remarks']?.trim(),
                    poReceived: data['PO Received']?.trim(),
                    oldGst: data['Old GST %']?.trim(),
                    newGst: data['New GST%']?.trim(),
                    gstChange: data['GST Change']?.trim(),
                    oldMrp: data['Old MRP']?.trim(),
                    newMrp: data['New MRP']?.trim(),
                    oldHsn: data['Old HSN']?.trim(),
                    newHsn: data['New HSN']?.trim(),
                    oldGrammage: data['Old Grammage']?.trim(),
                    newGrammage: data['New Grammage']?.trim(),
                    driveLink: data['Drive Link']?.trim(),
                    npiStatus: data['NPI status']?.trim(),
                });
            })
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
};
