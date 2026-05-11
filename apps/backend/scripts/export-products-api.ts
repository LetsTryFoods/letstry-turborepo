/**
 * Fetches all products from the live GraphQL API and exports to Excel.
 * Usage:
 *   ADMIN_TOKEN=<jwt> ts-node -r tsconfig-paths/register scripts/export-products-api.ts
 *   or pass token as first CLI arg:
 *   ts-node -r tsconfig-paths/register scripts/export-products-api.ts <jwt>
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as ExcelJS from 'exceljs';
import axios from 'axios';

dotenv.config({ path: path.join(__dirname, '../.env') });

const GQL_URL =
  process.env.GRAPHQL_URL || 'https://apiv3.letstryfoods.com/graphql';

const TOKEN = process.argv[2] || process.env.ADMIN_TOKEN || '';

// ── GraphQL query ────────────────────────────────────────────────────────────

const GET_PRODUCTS_QUERY = `
  query GetProducts($pagination: PaginationInput, $includeOutOfStock: Boolean, $includeArchived: Boolean) {
    products(pagination: $pagination, includeOutOfStock: $includeOutOfStock, includeArchived: $includeArchived) {
      items {
        _id
        name
        slug
        description
        categoryIds
        brand
        gtin
        mpn
        currency
        ingredients
        allergens
        shelfLife
        isVegetarian
        isGlutenFree
        rating
        ratingCount
        keywords
        tags
        isArchived
        favourite
        createdAt
        updatedAt
        categories { _id name slug }
        variants {
          _id
          sku
          name
          price
          mrp
          discountPercent
          discountSource
          weight
          weightUnit
          packageSize
          length
          height
          breadth
          stockQuantity
          availabilityStatus
          thumbnailUrl
          isDefault
          isActive
        }
        priceRange { min max }
      }
      meta {
        totalCount
        page
        limit
        totalPages
        hasNextPage
      }
    }
  }
`;

// ── GQL helper ───────────────────────────────────────────────────────────────

async function gqlFetch(variables: Record<string, unknown>) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

  const res = await axios.post(
    GQL_URL,
    { query: GET_PRODUCTS_QUERY, variables },
    { headers },
  );

  if (res.data.errors?.length) {
    throw new Error(res.data.errors.map((e: { message: string }) => e.message).join(', '));
  }
  return res.data.data.products;
}

// ── Fetch all products (auto-paginate) ───────────────────────────────────────

async function fetchAllProducts() {
  const PAGE_SIZE = 200;
  let page = 1;
  const allProducts: unknown[] = [];

  console.log(`Connecting to: ${GQL_URL}`);

  while (true) {
    process.stdout.write(`  Fetching page ${page}...`);
    const result = await gqlFetch({
      pagination: { page, limit: PAGE_SIZE },
      includeOutOfStock: true,
      includeArchived: true,
    });

    const items: unknown[] = result.items || [];
    allProducts.push(...items);

    const { totalCount, hasNextPage } = result.meta;
    console.log(` ${items.length} products (total so far: ${allProducts.length} / ${totalCount})`);

    if (!hasNextPage) break;
    page++;
  }

  return allProducts as ProductRow[];
}

// ── Types ────────────────────────────────────────────────────────────────────

interface Variant {
  _id: string;
  sku: string;
  name: string;
  price: number;
  mrp: number;
  discountPercent: number;
  discountSource: string;
  weight: number;
  weightUnit: string;
  packageSize: string;
  length: number;
  height: number;
  breadth: number;
  stockQuantity: number;
  availabilityStatus: string;
  thumbnailUrl: string;
  isDefault: boolean;
  isActive: boolean;
}

interface ProductRow {
  _id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  gtin: string;
  mpn: string;
  currency: string;
  ingredients: string;
  allergens: string;
  shelfLife: string;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  rating: number;
  ratingCount: number;
  keywords: string[];
  tags: string[];
  isArchived: boolean;
  favourite: boolean;
  createdAt: string;
  updatedAt: string;
  categories: { name: string }[];
  variants: Variant[];
  priceRange?: { min: number; max: number };
}

// ── Excel builder ────────────────────────────────────────────────────────────

const HEADER_COLOR = 'FF0C5273'; // brand dark teal
const ROW_EVEN     = 'FFF0F7FA';
const ROW_ODD      = 'FFFFFFFF';

function styleHeader(row: ExcelJS.Row) {
  row.height = 24;
  row.eachCell((cell) => {
    cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_COLOR } };
    cell.font   = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' },
    };
  });
}

function styleDataRow(row: ExcelJS.Row, rowIndex: number) {
  const argb = rowIndex % 2 === 0 ? ROW_EVEN : ROW_ODD;
  row.height = 18;
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border    = {
      top: { style: 'hair' }, bottom: { style: 'hair' },
      left: { style: 'hair' }, right: { style: 'hair' },
    };
  });
}

async function buildExcel(products: ProductRow[]): Promise<string> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'LetsTry Admin Export';
  workbook.created = new Date();

  // ── Sheet 1: Products × Variants (one row per variant) ──────────────────

  const sheet = workbook.addWorksheet('Products', {
    views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }],
  });

  sheet.columns = [
    // Product info
    { header: 'Product ID',      key: 'productId',    width: 28 },
    { header: 'Name',            key: 'name',         width: 35 },
    { header: 'Slug',            key: 'slug',         width: 35 },
    { header: 'Brand',           key: 'brand',        width: 18 },
    { header: 'Categories',      key: 'categories',   width: 32 },
    { header: 'Description',     key: 'description',  width: 50 },
    { header: 'Ingredients',     key: 'ingredients',  width: 50 },
    { header: 'Allergens',       key: 'allergens',    width: 25 },
    { header: 'Shelf Life',      key: 'shelfLife',    width: 18 },
    { header: 'Vegetarian',      key: 'isVegetarian', width: 13 },
    { header: 'Gluten Free',     key: 'isGlutenFree', width: 13 },
    { header: 'Archived',        key: 'isArchived',   width: 11 },
    { header: 'Favourite',       key: 'favourite',    width: 11 },
    { header: 'Rating',          key: 'rating',       width: 10 },
    { header: 'Rating Count',    key: 'ratingCount',  width: 14 },
    { header: 'Tags',            key: 'tags',         width: 28 },
    { header: 'Keywords',        key: 'keywords',     width: 28 },
    { header: 'GTIN',            key: 'gtin',         width: 20 },
    { header: 'MPN',             key: 'mpn',          width: 16 },
    { header: 'Currency',        key: 'currency',     width: 10 },
    // Variant info
    { header: 'Variant SKU',     key: 'variantSku',   width: 20 },
    { header: 'Variant Name',    key: 'variantName',  width: 28 },
    { header: 'Price (₹)',       key: 'price',        width: 13 },
    { header: 'MRP (₹)',         key: 'mrp',          width: 13 },
    { header: 'Discount %',      key: 'discountPct',  width: 13 },
    { header: 'Discount Source', key: 'discSrc',      width: 16 },
    { header: 'Weight',          key: 'weight',       width: 11 },
    { header: 'Weight Unit',     key: 'weightUnit',   width: 13 },
    { header: 'Package Size',    key: 'packageSize',  width: 15 },
    { header: 'Length (cm)',     key: 'length',       width: 13 },
    { header: 'Height (cm)',     key: 'height',       width: 13 },
    { header: 'Breadth (cm)',    key: 'breadth',      width: 13 },
    { header: 'Stock',           key: 'stock',        width: 11 },
    { header: 'Availability',    key: 'availability', width: 18 },
    { header: 'Default Variant', key: 'isDefault',    width: 16 },
    { header: 'Variant Active',  key: 'isActive',     width: 15 },
    { header: 'Thumbnail URL',   key: 'thumbnail',    width: 55 },
    // Timestamps
    { header: 'Created At',      key: 'createdAt',    width: 22 },
    { header: 'Updated At',      key: 'updatedAt',    width: 22 },
  ];

  styleHeader(sheet.getRow(1));
  sheet.autoFilter = { from: 'A1', to: 'AM1' };

  let dataRow = 2;

  for (const product of products) {
    const catNames = (product.categories || []).map((c) => c.name).join(', ');
    const variants  = product.variants || [];

    const baseFields = {
      productId:   product._id,
      name:        product.name,
      slug:        product.slug,
      brand:       product.brand || '',
      categories:  catNames,
      description: product.description || '',
      ingredients: product.ingredients || '',
      allergens:   product.allergens || '',
      shelfLife:   product.shelfLife || '',
      isVegetarian: product.isVegetarian ? 'Yes' : 'No',
      isGlutenFree: product.isGlutenFree ? 'Yes' : 'No',
      isArchived:  product.isArchived ? 'Yes' : 'No',
      favourite:   product.favourite  ? 'Yes' : 'No',
      rating:      product.rating      ?? '',
      ratingCount: product.ratingCount ?? 0,
      tags:        (product.tags     || []).join(', '),
      keywords:    (product.keywords || []).join(', '),
      gtin:        product.gtin     || '',
      mpn:         product.mpn      || '',
      currency:    product.currency || 'INR',
    };

    const timestamps = {
      createdAt: product.createdAt ? new Date(product.createdAt).toLocaleString('en-IN') : '',
      updatedAt: product.updatedAt ? new Date(product.updatedAt).toLocaleString('en-IN') : '',
    };

    if (variants.length === 0) {
      const row = sheet.addRow({ ...baseFields, ...timestamps });
      styleDataRow(row, dataRow++);
    } else {
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const row = sheet.addRow({
          // Show product info only on first variant row
          ...(i === 0 ? baseFields : Object.fromEntries(Object.keys(baseFields).map((k) => [k, '']))),
          variantSku:  v.sku,
          variantName: v.name,
          price:       v.price,
          mrp:         v.mrp,
          discountPct: v.discountPercent,
          discSrc:     v.discountSource || '',
          weight:      v.weight,
          weightUnit:  v.weightUnit || '',
          packageSize: v.packageSize || '',
          length:      v.length ?? '',
          height:      v.height ?? '',
          breadth:     v.breadth ?? '',
          stock:       v.stockQuantity,
          availability: v.availabilityStatus || '',
          isDefault:   v.isDefault ? 'Yes' : 'No',
          isActive:    v.isActive  ? 'Yes' : 'No',
          thumbnail:   v.thumbnailUrl || '',
          ...(i === 0 ? timestamps : { createdAt: '', updatedAt: '' }),
        });
        styleDataRow(row, dataRow++);
      }
    }
  }

  // ── Sheet 2: Summary ─────────────────────────────────────────────────────

  const summary = workbook.addWorksheet('Summary');

  summary.columns = [
    { header: 'Metric',  key: 'metric',  width: 30 },
    { header: 'Value',   key: 'value',   width: 20 },
  ];

  styleHeader(summary.getRow(1));

  const totalVariants = products.reduce((s, p) => s + (p.variants?.length || 0), 0);
  const activeProducts = products.filter((p) => !p.isArchived).length;
  const inStock  = products.filter((p) =>
    (p.variants || []).some((v) => v.availabilityStatus === 'IN_STOCK'),
  ).length;
  const vegCount = products.filter((p) => p.isVegetarian).length;

  const rows = [
    { metric: 'Total Products',          value: products.length },
    { metric: 'Active (not archived)',   value: activeProducts },
    { metric: 'Archived',                value: products.length - activeProducts },
    { metric: 'Total Variants',          value: totalVariants },
    { metric: 'Products With Stock',     value: inStock },
    { metric: 'Vegetarian Products',     value: vegCount },
    { metric: 'Exported At',             value: new Date().toLocaleString('en-IN') },
    { metric: 'API Endpoint',            value: GQL_URL },
  ];

  rows.forEach((r, idx) => {
    const row = summary.addRow(r);
    styleDataRow(row, idx + 2);
  });

  // ── Write file ───────────────────────────────────────────────────────────

  const outDir  = path.join(__dirname, '../assets');
  const outFile = path.join(outDir, `products-export-${Date.now()}.xlsx`);
  await workbook.xlsx.writeFile(outFile);
  return outFile;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!TOKEN) {
    console.error(
      '❌  No auth token provided.\n' +
      '   Pass it as first arg or set ADMIN_TOKEN env var:\n' +
      '   ts-node ... export-products-api.ts <your-jwt-token>',
    );
    process.exit(1);
  }

  console.log('🚀 Starting product export from GraphQL API...\n');

  const products = await fetchAllProducts();
  console.log(`\n✅ Fetched ${products.length} products total.\n`);

  console.log('📊 Building Excel workbook...');
  const outFile = await buildExcel(products);

  console.log(`\n✅ Done! File saved to:\n   ${outFile}\n`);
}

main().catch((err) => {
  console.error('❌ Export failed:', err.message || err);
  process.exit(1);
});
