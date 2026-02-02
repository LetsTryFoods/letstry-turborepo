import { CSVProduct } from './csv-parser';

export interface ComparisonResult {
    csvTotal: number;
    dbTotal: number;
    missing: CSVProduct[];
    method: string;
}

export const generateReport = (result: ComparisonResult) => {
    console.log('\n' + '='.repeat(40));
    console.log('=== Product Comparison Report ===');
    console.log('='.repeat(40));
    console.log(`Comparison Method: ${result.method}`);
    console.log(`CSV Products:      ${result.csvTotal}`);
    console.log(`Matched in DB:     ${result.csvTotal - result.missing.length}`);
    console.log(`Missing from DB:   ${result.missing.length}`);
    console.log('='.repeat(40));

    if (result.missing.length > 0) {
        console.log('\nMissing Products:');
        result.missing.forEach((product, index) => {
            console.log(`${index + 1}. SKU: ${product.sku || 'N/A'} - ${product.name} (Old EAN: ${product.oldEan || 'N/A'}, New EAN: ${product.newEan || 'N/A'})`);
        });
    } else {
        console.log('\n✅ All products in CSV were found in the database!');
    }

    const matchRate = ((result.csvTotal - result.missing.length) / result.csvTotal * 100).toFixed(2);
    console.log(`\nMatch Rate: ${matchRate}%`);
    console.log('='.repeat(40) + '\n');
};
