const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/backend/.env') });

// Try to require exceljs, either from hoisted root or backend node_modules
let ExcelJS;
try {
  ExcelJS = require('exceljs');
} catch (e) {
  ExcelJS = require(path.join(__dirname, '../apps/backend/node_modules/exceljs'));
}

async function exportProducts() {
  const isTest = process.argv.includes('--test');
  const uri = process.env.MONGODB_CONNECTION_STRING || process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_CONNECTION_STRING not found in apps/backend/.env");
    process.exit(1);
  }

  console.log(`🔌 Connecting to MongoDB...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log(`✅ Connected successfully!`);

    const db = client.db(); // Uses the DB from connection string
    const productsCollection = db.collection('products');

    let query = { isArchived: { $ne: true } };

    console.log(`🔍 Fetching products ${isTest ? '(TEST MODE: Limit 5)' : ''}...`);
    let cursor = productsCollection.find(query);

    if (isTest) {
      cursor = cursor.limit(5);
    }

    const products = await cursor.toArray();
    console.log(`📦 Found ${products.length} products.`);

    if (products.length === 0) {
      console.log("No products found to export.");
      return;
    }

    // Process data for Excel
    const rows = [];

    products.forEach((product) => {
      // Base product fields
      const productName = product.name;
      const gtin = product.gtin || '';
      const brand = product.brand || '';
      const shelfLife = product.shelfLife || '';

      if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach((variant) => {
          // If variants can be archived/inactive, you could filter them here.
          // But we'll include all variants of active products for now.

          // Extract all image URLs
          let imageUrls = [];
          if (variant.images && Array.isArray(variant.images)) {
            imageUrls = variant.images
              .map(img => {
                // If it's just a filename, prepend the R2 base url
                if (img.url && !img.url.startsWith('http')) {
                  return `https://pub-56a649c88d67403e867a9e00f3b37d78.r2.dev/${img.url}`;
                }
                return img.url;
              })
              .filter(Boolean);
          }

          const rowData = {
            'Product Name': productName,
            'Variant Name': variant.name || productName,
            'Brand': brand,
            'Product GTIN': gtin,
            'Variant SKU / EAN': variant.sku || '',
            'MRP (₹)': variant.mrp || 0,
            'Selling Price (₹)': variant.price || 0,
            'Weight': `${variant.weight || ''}${variant.weightUnit || ''}`,
            'Shelf Life': shelfLife,
            'Availability': variant.availabilityStatus || 'unknown',
          };

          // Add each image as a separate column for better readability in Excel
          imageUrls.forEach((url, idx) => {
            rowData[`Image ${idx + 1}`] = {
              text: url,
              hyperlink: url // Makes it a clickable link in Excel
            };
          });

          rows.push(rowData);
        });
      }
    });

    // Create Excel Workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');

    // Define columns based on all unique keys (since different rows might have different number of images)
    if (rows.length > 0) {
      const allKeys = new Set();
      rows.forEach(row => Object.keys(row).forEach(k => allKeys.add(k)));

      worksheet.columns = Array.from(allKeys).map(key => ({
        header: key,
        key: key,
        width: key.startsWith('Image') ? 45 : Math.max(key.length + 5, 15)
      }));

      // Make header row bold and centered
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = { horizontal: 'center' };

      // Add rows
      worksheet.addRows(rows);
    }

    const fileName = isTest ? 'products_export_test.xlsx' : 'products_export.xlsx';
    const filePath = path.join(__dirname, fileName);

    await workbook.xlsx.writeFile(filePath);
    console.log(`✅ Excel file generated successfully: ${filePath}`);

  } catch (err) {
    console.error('❌ Error during export:', err);
  } finally {
    await client.close();
    console.log('🔒 Connection closed.');
  }
}

exportProducts();
