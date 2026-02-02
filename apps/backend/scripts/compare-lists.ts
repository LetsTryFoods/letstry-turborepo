import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';

const MISSING_JSON_PATH = path.resolve(__dirname, 'missing-products.json');
const DETAILS_CSV_PATH = path.resolve("/Users/apple/Desktop/Let's Try - Products Details - Sheet1.csv");

interface MissingProduct {
    sku: string;
    name: string;
    oldEan: string;
    newEan: string;
}

async function main() {
    console.log('--- List Comparison: Missing Products vs Detailed Master Sheet ---');

    if (!fs.existsSync(MISSING_JSON_PATH)) {
        console.error('Error: missing-products.json not found. Run the database comparison script first.');
        process.exit(1);
    }

    // 1. Load Missing Products (JSON)
    const missingProducts: MissingProduct[] = JSON.parse(fs.readFileSync(MISSING_JSON_PATH, 'utf-8'));
    const missingEansMap = new Map<string, MissingProduct>();
    missingProducts.forEach(p => {
        if (p.newEan) missingEansMap.set(p.newEan, p);
    });
    console.log(`Loaded ${missingProducts.length} missing products.`);

    // 2. Load Details Products (CSV) using robust parser
    const detailsProducts: any[] = [];
    const detailsEansSet = new Set<string>();

    await new Promise((resolve, reject) => {
        fs.createReadStream(DETAILS_CSV_PATH)
            .pipe(csv())
            .on('data', (data) => {
                const ean = data['EAN/Bar Code']?.trim();
                if (ean && ean !== 'N/A' && ean !== '') {
                    detailsProducts.push(data);
                    detailsEansSet.add(ean);
                }
            })
            .on('end', resolve)
            .on('error', reject);
    });
    console.log(`Loaded ${detailsProducts.length} valid products from Details CSV.`);

    // 3. Comparison Logic
    const missingFoundInDetails: MissingProduct[] = [];
    const missingNotFoundInDetails: MissingProduct[] = [];
    const detailsNotInMissing: any[] = [];

    // Check Missing vs Details
    for (const prod of missingProducts) {
        if (detailsEansSet.has(prod.newEan)) {
            missingFoundInDetails.push(prod);
        } else {
            missingNotFoundInDetails.push(prod);
        }
    }

    // Check Details vs Missing
    for (const detailProd of detailsProducts) {
        const ean = detailProd['EAN/Bar Code']?.trim();
        if (!missingEansMap.has(ean)) {
            detailsNotInMissing.push(detailProd);
        }
    }

    // 4. Report
    console.log('\n' + '='.repeat(40));
    console.log('=== Comparison Summary ===');
    console.log(`1. Found in Details list:     ${missingFoundInDetails.length}`);
    console.log(`2. NOT found in Details list: ${missingNotFoundInDetails.length}`);
    console.log(`3. Details items NOT missing: ${detailsNotInMissing.length}`);
    console.log('='.repeat(40) + '\n');

    // 5. Save Results
    const writeJson = (name: string, data: any) => {
        const p = path.resolve(__dirname, name);
        fs.writeFileSync(p, JSON.stringify(data, null, 2));
        console.log(`📄 Saved: ${name}`);
    };

    writeJson('missing_found_in_details.json', missingFoundInDetails);
    writeJson('missing_not_found_in_details.json', missingNotFoundInDetails);
    writeJson('details_not_in_missing.json', detailsNotInMissing);

    console.log('\nAnalysis complete.');
}

main().catch(console.error);
