import { connectDB, disconnectDB } from './utils/db-connector';
import { parseCSV, CSVProduct } from './utils/csv-parser';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import * as ExcelJS from 'exceljs';

// Paths
const SWIGGY_CSV_PATH = path.resolve('/Users/apple/Desktop/Swiggy Master File - New File.csv');
const OLDER_CSV_PATH = path.resolve("/Users/apple/Desktop/Let's Try - Products Details - Sheet1.csv");

// DB Schema
const ProductSchema = new mongoose.Schema({
    variants: [{ sku: String }],
    gtin: String,
});
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function main() {
    const args = process.argv.slice(2);
    const compareBy = args.find(arg => arg.startsWith('--by='))?.split('=')[1] || 'all';

    if (!['sku', 'old-ean', 'new-ean', 'all'].includes(compareBy)) {
        console.error('Invalid comparison method. Use --by=sku, --by=old-ean, --by=new-ean, or --by=all');
        process.exit(1);
    }

    console.log(`🚀 Starting Final Three-File Comparison (By: ${compareBy})...\n`);

    await connectDB();

    try {
        // 1. Load Swiggy Products (cleaned)
        const swiggyRaw = await parseCSV(SWIGGY_CSV_PATH);
        const swiggyProducts = swiggyRaw.filter(p => {
            const hasSku = p.sku && p.sku !== '' && p.sku !== 'N/A';
            const hasOldEan = p.oldEan && p.oldEan !== '' && p.oldEan !== 'N/A';
            const hasNewEan = p.newEan && p.newEan !== '' && p.newEan !== 'N/A';

            if (compareBy === 'sku') return hasSku;
            if (compareBy === 'old-ean') return hasOldEan;
            if (compareBy === 'new-ean') return hasNewEan;
            return hasSku || hasOldEan || hasNewEan; // 'all' case
        });
        console.log(`✅ Loaded ${swiggyProducts.length} filtered products from Swiggy file (By: ${compareBy}).`);

        // 2. Load Older File EANs
        const olderEans = new Set<string>();
        await new Promise((resolve, reject) => {
            if (!fs.existsSync(OLDER_CSV_PATH)) {
                return reject(new Error(`Older CSV file not found at ${OLDER_CSV_PATH}`));
            }
            fs.createReadStream(OLDER_CSV_PATH)
                .pipe(csv())
                .on('data', (data) => {
                    const ean = data['EAN/Bar Code']?.trim();
                    if (ean && ean !== '' && ean !== 'N/A') olderEans.add(ean);
                })
                .on('end', resolve)
                .on('error', reject);
        });
        console.log(`✅ Loaded ${olderEans.size} unique EANs from Older file.`);

        // 3. Process Logic
        const fileA: CSVProduct[] = []; // Swiggy but not in DB
        const fileB: CSVProduct[] = []; // Swiggy but not in Older file

        for (const prod of swiggyProducts) {
            // Check DB
            const queries: any[] = [];
            if (compareBy === 'sku' || compareBy === 'all') {
                if (prod.sku && prod.sku !== 'N/A') {
                    queries.push({ 'variants.sku': prod.sku });
                    queries.push({ gtin: prod.sku });
                }
            }
            if (compareBy === 'new-ean' || compareBy === 'all') {
                if (prod.newEan && prod.newEan !== 'N/A') {
                    queries.push({ gtin: prod.newEan });
                    queries.push({ 'variants.sku': prod.newEan });
                }
            }
            if (compareBy === 'old-ean' || compareBy === 'all') {
                if (prod.oldEan && prod.oldEan !== 'N/A') {
                    queries.push({ gtin: prod.oldEan });
                    queries.push({ 'variants.sku': prod.oldEan });
                }
            }

            let inDb = false;
            if (queries.length > 0) {
                const dbProduct = await Product.findOne({ $or: queries });
                if (dbProduct) inDb = true;
            }

            if (!inDb) {
                fileA.push(prod);
            }

            // Check Older File
            let inOlder = false;
            if (compareBy === 'sku' || compareBy === 'all') {
                if (prod.sku && prod.sku !== 'N/A' && olderEans.has(prod.sku)) inOlder = true;
            }
            if (compareBy === 'new-ean' || compareBy === 'all') {
                if (prod.newEan && prod.newEan !== 'N/A' && olderEans.has(prod.newEan)) inOlder = true;
            }
            if (compareBy === 'old-ean' || compareBy === 'all') {
                if (prod.oldEan && prod.oldEan !== 'N/A' && olderEans.has(prod.oldEan)) inOlder = true;
            }

            if (!inOlder) {
                fileB.push(prod);
            }
        }

        // File C: Not in older file but in File A
        const fileC = fileA.filter(prod => {
            let inOlder = false;
            if (compareBy === 'sku' || compareBy === 'all') {
                if (prod.sku && prod.sku !== 'N/A' && olderEans.has(prod.sku)) inOlder = true;
            }
            if (compareBy === 'new-ean' || compareBy === 'all') {
                if (prod.newEan && prod.newEan !== 'N/A' && olderEans.has(prod.newEan)) inOlder = true;
            }
            if (compareBy === 'old-ean' || compareBy === 'all') {
                if (prod.oldEan && prod.oldEan !== 'N/A' && olderEans.has(prod.oldEan)) inOlder = true;
            }
            return !inOlder;
        });

        // 4. Save Results
        const saveJson = (name: string, data: any) => {
            const outPath = path.resolve(__dirname, name);
            const output = {
                items: data,
                totalCount: data.length
            };
            fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
            console.log(`📄 Saved JSON: ${name} (${data.length} items)`);
        };

        const saveCsv = (name: string, data: CSVProduct[]) => {
            const outPath = path.resolve(__dirname, name);
            const headers = [
                'Sku Code', 'Sku Name', 'Campaign', 'Remarks', 'PO Received',
                'Old GST %', 'New GST%', 'GST Change', 'Old MRP', 'New MRP',
                'Old EAN', 'New EAN', 'Old HSN', 'New HSN', 'Old Grammage',
                'New Grammage', 'Drive Link', 'NPI status'
            ];

            const rows = data.map(p => [
                p.sku, p.name, p.campaign, p.remarks, p.poReceived,
                p.oldGst, p.newGst, p.gstChange, p.oldMrp, p.newMrp,
                p.oldEan, p.newEan, p.oldHsn, p.newHsn, p.oldGrammage,
                p.newGrammage, p.driveLink, p.npiStatus
            ].map(val => `"${(val || '').replace(/"/g, '""')}"`).join(','));

            const csvContent = [headers.join(','), ...rows].join('\n');
            fs.writeFileSync(outPath, csvContent);
            console.log(`📊 Saved CSV: ${name} (${data.length} items)`);
        };

        const saveExcel = async (name: string, data: CSVProduct[]) => {
            const outPath = path.resolve(__dirname, name);
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Missing Products');

            worksheet.columns = [
                { header: 'Sku Code', key: 'sku', width: 15 },
                { header: 'Sku Name', key: 'name', width: 30 },
                { header: 'Campaign', key: 'campaign', width: 20 },
                { header: 'Remarks', key: 'remarks', width: 25 },
                { header: 'PO Received', key: 'poReceived', width: 15 },
                { header: 'Old GST %', key: 'oldGst', width: 12 },
                { header: 'New GST%', key: 'newGst', width: 12 },
                { header: 'GST Change', key: 'gstChange', width: 15 },
                { header: 'Old MRP', key: 'oldMrp', width: 10 },
                { header: 'New MRP', key: 'newMrp', width: 10 },
                { header: 'Old EAN', key: 'oldEan', width: 15 },
                { header: 'New EAN', key: 'newEan', width: 15 },
                { header: 'Old HSN', key: 'oldHsn', width: 12 },
                { header: 'New HSN', key: 'newHsn', width: 12 },
                { header: 'Old Grammage', key: 'oldGrammage', width: 15 },
                { header: 'New Grammage', key: 'newGrammage', width: 15 },
                { header: 'Drive Link', key: 'driveLink', width: 20 },
                { header: 'NPI status', key: 'npiStatus', width: 15 }
            ];

            worksheet.addRows(data);

            // Format headers
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };

            await workbook.xlsx.writeFile(outPath);
            console.log(`📗 Saved Excel: ${name} (${data.length} items)`);
        };

        console.log('\n--- Results Try ---');
        saveJson('file_a_swiggy_not_in_db.json', fileA);
        saveCsv('file_a_swiggy_not_in_db.csv', fileA);
        await saveExcel('file_a_swiggy_not_in_db.xlsx', fileA);
        saveJson('file_b_swiggy_not_in_older.json', fileB);
        saveJson('file_c_swiggy_not_in_db_not_in_older.json', fileC);

        console.log('\n✨ Comparison complete!');

    } catch (error) {
        console.error('❌ Error during comparison:', error);
    } finally {
        await disconnectDB();
    }
}

main().catch(console.error);
