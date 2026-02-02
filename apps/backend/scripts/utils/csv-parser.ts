import fs from 'fs';
import csv from 'csv-parser';

export interface CSVProduct {
    sku: string;
    name: string;
    oldEan: string;
    newEan: string;
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
                });
            })
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
};
