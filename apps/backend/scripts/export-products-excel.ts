import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as ExcelJS from 'exceljs';

dotenv.config({ path: path.join(__dirname, '../.env.development') });

const uri = process.env.DATABASE_URL;
const dbName = process.env.DATABASE_NAME || 'letstry_dev';

async function exportProducts() {
  const conn = await mongoose.connect(uri!, { dbName });
  const db = conn.connection.db!;

  const products = await db.collection('products').find({}).toArray();
  const categories = await db.collection('categories').find({}).toArray();

  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    categoryMap.set(cat._id.toString(), cat.name);
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Products');

  sheet.columns = [
    { header: 'Product ID', key: 'productId', width: 28 },
    { header: 'Name', key: 'name', width: 35 },
    { header: 'Slug', key: 'slug', width: 35 },
    { header: 'Brand', key: 'brand', width: 20 },
    { header: 'Categories', key: 'categories', width: 35 },
    { header: 'Description', key: 'description', width: 50 },
    { header: 'Ingredients', key: 'ingredients', width: 50 },
    { header: 'Allergens', key: 'allergens', width: 25 },
    { header: 'Shelf Life', key: 'shelfLife', width: 18 },
    { header: 'Is Vegetarian', key: 'isVegetarian', width: 15 },
    { header: 'Is Gluten Free', key: 'isGlutenFree', width: 16 },
    { header: 'Is Archived', key: 'isArchived', width: 14 },
    { header: 'Rating', key: 'rating', width: 10 },
    { header: 'Rating Count', key: 'ratingCount', width: 14 },
    { header: 'Tags', key: 'tags', width: 30 },
    { header: 'Keywords', key: 'keywords', width: 30 },
    { header: 'GTIN', key: 'gtin', width: 20 },
    { header: 'MPN', key: 'mpn', width: 20 },
    { header: 'Currency', key: 'currency', width: 12 },
    { header: 'Variant SKU', key: 'variantSku', width: 20 },
    { header: 'Variant Name', key: 'variantName', width: 25 },
    { header: 'Price (₹)', key: 'price', width: 14 },
    { header: 'MRP (₹)', key: 'mrp', width: 14 },
    { header: 'Discount %', key: 'discountPercent', width: 14 },
    { header: 'Weight', key: 'weight', width: 12 },
    { header: 'Weight Unit', key: 'weightUnit', width: 14 },
    { header: 'Package Size', key: 'packageSize', width: 16 },
    { header: 'Stock Quantity', key: 'stockQuantity', width: 16 },
    { header: 'Availability', key: 'availabilityStatus', width: 18 },
    { header: 'Variant Active', key: 'variantActive', width: 15 },
    { header: 'Is Default Variant', key: 'isDefault', width: 18 },
    { header: 'Thumbnail URL', key: 'thumbnailUrl', width: 60 },
    { header: 'Created At', key: 'createdAt', width: 22 },
    { header: 'Updated At', key: 'updatedAt', width: 22 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0C5273' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' },
    };
  });
  headerRow.height = 22;

  let rowIndex = 2;

  for (const product of products) {
    const categoryNames = (product.categoryIds || [])
      .map((id: string) => categoryMap.get(id.toString()) || id)
      .join(', ');

    const variants = product.variants || [];

    if (variants.length === 0) {
      sheet.addRow({
        productId: product._id.toString(),
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        categories: categoryNames,
        description: product.description || '',
        ingredients: product.ingredients || '',
        allergens: product.allergens || '',
        shelfLife: product.shelfLife || '',
        isVegetarian: product.isVegetarian ? 'Yes' : 'No',
        isGlutenFree: product.isGlutenFree ? 'Yes' : 'No',
        isArchived: product.isArchived ? 'Yes' : 'No',
        rating: product.rating || '',
        ratingCount: product.ratingCount || 0,
        tags: (product.tags || []).join(', '),
        keywords: (product.keywords || []).join(', '),
        gtin: product.gtin || '',
        mpn: product.mpn || '',
        currency: product.currency || 'INR',
        variantSku: '',
        variantName: '',
        price: '',
        mrp: '',
        discountPercent: '',
        weight: '',
        weightUnit: '',
        packageSize: '',
        stockQuantity: '',
        availabilityStatus: '',
        variantActive: '',
        isDefault: '',
        thumbnailUrl: '',
        createdAt: product.createdAt ? new Date(product.createdAt).toLocaleString('en-IN') : '',
        updatedAt: product.updatedAt ? new Date(product.updatedAt).toLocaleString('en-IN') : '',
      });
      rowIndex++;
    } else {
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        sheet.addRow({
          productId: i === 0 ? product._id.toString() : '',
          name: i === 0 ? product.name : '',
          slug: i === 0 ? product.slug : '',
          brand: i === 0 ? product.brand : '',
          categories: i === 0 ? categoryNames : '',
          description: i === 0 ? product.description || '' : '',
          ingredients: i === 0 ? product.ingredients || '' : '',
          allergens: i === 0 ? product.allergens || '' : '',
          shelfLife: i === 0 ? product.shelfLife || '' : '',
          isVegetarian: i === 0 ? (product.isVegetarian ? 'Yes' : 'No') : '',
          isGlutenFree: i === 0 ? (product.isGlutenFree ? 'Yes' : 'No') : '',
          isArchived: i === 0 ? (product.isArchived ? 'Yes' : 'No') : '',
          rating: i === 0 ? product.rating || '' : '',
          ratingCount: i === 0 ? product.ratingCount || 0 : '',
          tags: i === 0 ? (product.tags || []).join(', ') : '',
          keywords: i === 0 ? (product.keywords || []).join(', ') : '',
          gtin: i === 0 ? product.gtin || '' : '',
          mpn: i === 0 ? product.mpn || '' : '',
          currency: i === 0 ? product.currency || 'INR' : '',
          variantSku: v.sku,
          variantName: v.name,
          price: v.price,
          mrp: v.mrp,
          discountPercent: v.discountPercent,
          weight: v.weight,
          weightUnit: v.weightUnit,
          packageSize: v.packageSize,
          stockQuantity: v.stockQuantity,
          availabilityStatus: v.availabilityStatus,
          variantActive: v.isActive ? 'Yes' : 'No',
          isDefault: v.isDefault ? 'Yes' : 'No',
          thumbnailUrl: v.thumbnailUrl || '',
          createdAt: i === 0 && product.createdAt ? new Date(product.createdAt).toLocaleString('en-IN') : '',
          updatedAt: i === 0 && product.updatedAt ? new Date(product.updatedAt).toLocaleString('en-IN') : '',
        });
        rowIndex++;
      }
    }
  }

  sheet.eachRow((row, index) => {
    if (index === 1) return;
    const isEven = index % 2 === 0;
    row.eachCell((cell) => {
      cell.fill = {
        type: 'pattern', pattern: 'solid',
        fgColor: { argb: isEven ? 'FFF0F7FA' : 'FFFFFFFF' },
      };
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'hair' }, bottom: { style: 'hair' },
        left: { style: 'hair' }, right: { style: 'hair' },
      };
    });
    row.height = 18;
  });

  sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
  sheet.autoFilter = { from: 'A1', to: 'AH1' };

  const outputPath = path.join(__dirname, '../assets/products-export.xlsx');
  await workbook.xlsx.writeFile(outputPath);

  console.log(`✅ Exported ${products.length} products to: ${outputPath}`);
  await conn.disconnect();
}

exportProducts().catch((err) => {
  console.error('Export failed:', err);
  process.exit(1);
});
