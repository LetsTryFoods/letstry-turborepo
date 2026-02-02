import { connectDB, disconnectDB } from './utils/db-connector';
import { parseCSV } from './utils/csv-parser';
import { generateReport, ComparisonResult } from './utils/report-generator';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

// Minimal Product Schema for script usage
const ProductSchema = new mongoose.Schema({
    variants: [{ sku: String }],
    gtin: String,
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const CSV_PATH = path.resolve('/Users/apple/Desktop/Swiggy Master File - New File.csv');

async function main() {
    const args = process.argv.slice(2);
    const compareBy = args.find(arg => arg.startsWith('--by='))?.split('=')[1] || 'sku';

    if (!['sku', 'old-ean', 'new-ean', 'all'].includes(compareBy)) {
        console.error('Invalid comparison method. Use --by=sku, --by=old-ean, --by=new-ean, or --by=all');
        process.exit(1);
    }

    console.log(`Starting comparison using method: ${compareBy}...`);

    await connectDB();

    try {
        const csvProducts = await parseCSV(CSV_PATH);

        // Filter out products with no valid identifiers (SKU or EAN)
        const validProducts = csvProducts.filter(p => {
            const hasSku = p.sku && p.sku !== '' && p.sku !== 'N/A';
            const hasOldEan = p.oldEan && p.oldEan !== '' && p.oldEan !== 'N/A';
            const hasNewEan = p.newEan && p.newEan !== '' && p.newEan !== 'N/A';
            return hasSku || hasOldEan || hasNewEan;
        });

        const missing: typeof csvProducts = [];

        for (const csvProd of validProducts) {

            let found = false;
            const queries: any[] = [];

            if (compareBy === 'sku' || compareBy === 'all') {
                if (csvProd.sku) {
                    queries.push({ 'variants.sku': csvProd.sku });
                    queries.push({ gtin: csvProd.sku });
                }
            }

            if (compareBy === 'old-ean' || compareBy === 'all') {
                if (csvProd.oldEan) {
                    queries.push({ gtin: csvProd.oldEan });
                    queries.push({ 'variants.sku': csvProd.oldEan });
                }
            }

            if (compareBy === 'new-ean' || compareBy === 'all') {
                if (csvProd.newEan) {
                    queries.push({ gtin: csvProd.newEan });
                    queries.push({ 'variants.sku': csvProd.newEan });
                }
            }

            if (queries.length > 0) {
                const dbProduct = await Product.findOne({ $or: queries });
                if (dbProduct) {
                    found = true;
                }
            }

            if (!found) {
                missing.push(csvProd);
            }
        }

        const result: ComparisonResult = {
            csvTotal: validProducts.length,
            dbTotal: await Product.countDocuments(),
            missing,
            method: compareBy.toUpperCase()
        };

        generateReport(result);

        // Save missing products to JSON file
        const outputPath = path.resolve(__dirname, 'missing-products.json');
        fs.writeFileSync(outputPath, JSON.stringify(missing, null, 2));
        console.log(`\n📄 Saved missing products list to: ${outputPath}`);

    } catch (error) {
        console.error('An error occurred during comparison:', error);
    } finally {
        await disconnectDB();
    }
}

main();
