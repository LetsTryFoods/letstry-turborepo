import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import csv from 'csv-parser';
import axios from 'axios';
import { execSync } from 'child_process';
import sharp from 'sharp';

const ENV_FILE = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, '../.env.production')
  : path.join(__dirname, '../.env.development');

dotenv.config({ path: ENV_FILE });

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://admin:password@localhost:27017/letstry_dev?authSource=admin';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

interface CSVRow {
  'Sku Code': string;
  'Sku Name': string;
  'Campaign': string;
  'Remarks': string;
  'PO Received': string;
  'Old GST %': string;
  'New GST%': string;
  'GST Change': string;
  'Old MRP': string;
  'New MRP': string;
  'Old EAN': string;
  'New EAN': string;
  'Old HSN': string;
  'New HSN': string;
  'Old Grammage': string;
  'New Grammage': string;
  'Drive Link': string;
  'NPI status': string;
  'Ingredients': string;
  'catgeory': string;
  'allergens ': string;
  'Length': string;
  'breadth': string;
  'Height': string;
  'shelf life': string;
}

interface ProcessedProduct {
  name: string;
  slug: string;
  brand: string;
  gtin: string;
  categoryIds: string[];
  currency: string;
  ingredients: string;
  allergens?: string;
  shelfLife: string;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  keywords: string[];
  tags: string[];
  description?: string;
  ratingCount: number;
  isArchived: boolean;
  variants: Array<{
    sku: string;
    name: string;
    mrp: number;
    price: number;
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
    images: Array<{ url: string; alt: string }>;
    thumbnailUrl: string;
    isDefault: boolean;
    isActive: boolean;
  }>;
}

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  brand: String,
  gtin: String,
  categoryIds: [String],
  currency: String,
  ingredients: String,
  allergens: String,
  shelfLife: String,
  isVegetarian: Boolean,
  isGlutenFree: Boolean,
  keywords: [String],
  tags: [String],
  description: String,
  ratingCount: Number,
  isArchived: Boolean,
  variants: [{
    sku: String,
    name: String,
    mrp: Number,
    price: Number,
    discountPercent: Number,
    discountSource: String,
    weight: Number,
    weightUnit: String,
    packageSize: String,
    length: Number,
    height: Number,
    breadth: Number,
    stockQuantity: Number,
    availabilityStatus: String,
    images: [{ url: String, alt: String }],
    thumbnailUrl: String,
    isDefault: Boolean,
    isActive: Boolean,
  }],
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const DISCOUNT_PERCENT = 30;
const DEFAULT_STOCK = 1000;
const DEFAULT_SHELF_LIFE_DAYS = 180;
const GENERIC_ALLERGENS = 'May contain traces of nuts, wheat, and dairy products';

class Logger {
  private logs: string[] = [];
  
  info(message: string) {
    const msg = `[INFO] ${message}`;
    console.log(msg);
    this.logs.push(msg);
  }
  
  warn(message: string) {
    const msg = `[WARN] ${message}`;
    console.warn(msg);
    this.logs.push(msg);
  }
  
  error(message: string) {
    const msg = `[ERROR] ${message}`;
    console.error(msg);
    this.logs.push(msg);
  }
  
  success(message: string) {
    const msg = `[SUCCESS] ${message}`;
    console.log(`\x1b[32m${msg}\x1b[0m`);
    this.logs.push(msg);
  }
  
  getLogs() {
    return this.logs;
  }
}

const logger = new Logger();

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isValidRow(row: CSVRow, rowIndex: number): { valid: boolean; reason?: string } {
  const skuCode = row['Sku Code']?.trim();
  const skuName = row['Sku Name']?.trim();
  const newMRP = row['New MRP']?.trim();
  const newGrammage = row['New Grammage']?.trim();
  const newEAN = row['New EAN']?.trim();
  const ingredients = row['Ingredients']?.trim();
  const category = row['catgeory']?.trim();
  const driveLink = row['Drive Link']?.trim();
  const length = row['Length']?.trim();
  const breadth = row['breadth']?.trim();
  const height = row['Height']?.trim();

  if (!skuCode || skuCode === 'N/A') {
    return { valid: false, reason: 'Missing Sku Code' };
  }
  
  if (!skuName) {
    return { valid: false, reason: 'Missing Sku Name' };
  }
  
  if (!newMRP || newMRP === '0' || isNaN(Number(newMRP))) {
    return { valid: false, reason: 'Missing or invalid New MRP' };
  }
  
  if (!newGrammage || newGrammage === '0' || isNaN(Number(newGrammage))) {
    return { valid: false, reason: 'Missing or invalid New Grammage' };
  }
  
  if (!newEAN || newEAN === 'N/A' || newEAN.startsWith('#')) {
    return { valid: false, reason: 'Missing or invalid New EAN' };
  }
  
  if (!ingredients) {
    return { valid: false, reason: 'Missing Ingredients' };
  }
  
  if (!category) {
    return { valid: false, reason: 'Missing Category' };
  }
  
  if (!driveLink || driveLink === '#N/A' || driveLink.startsWith('#') || driveLink === 'N/A') {
    return { valid: false, reason: 'Missing or invalid Drive Link' };
  }
  
  if (!length || !breadth || !height || isNaN(Number(length)) || isNaN(Number(breadth)) || isNaN(Number(height))) {
    return { valid: false, reason: 'Missing or invalid dimensions' };
  }
  
  return { valid: true };
}

async function getOrCreateCategory(categoryName: string): Promise<string> {
  const slug = generateSlug(categoryName);
  
  let category = await Category.findOne({ slug });
  
  if (!category) {
    logger.info(`Creating new category: ${categoryName}`);
    category = await Category.create({
      name: categoryName,
      slug: slug,
      description: `Premium ${categoryName} from Let's Try`,
      isArchived: false,
    });
    logger.success(`Category created: ${categoryName} (${category._id})`);
  } else {
    logger.info(`Using existing category: ${categoryName} (${category._id})`);
  }
  
  return category._id.toString();
}

function extractDriveFolderId(driveLink: string): string | null {
  const match = driveLink.match(/folders\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

async function downloadImagesFromDrive(driveLink: string, skuCode: string, imagesFolder: string): Promise<boolean> {
  const folderId = extractDriveFolderId(driveLink);
  
  if (!folderId) {
    logger.warn(`Could not extract folder ID from Drive link: ${driveLink}`);
    return false;
  }
  
  const targetFolder = path.join(imagesFolder, skuCode);
  
  if (fs.existsSync(targetFolder) && fs.readdirSync(targetFolder).length > 0) {
    logger.info(`Images already exist in folder: ${targetFolder}`);
    return true;
  }
  
  fs.mkdirSync(targetFolder, { recursive: true });
  
  try {
    logger.info(`Attempting to download images from Google Drive...`);
    logger.info(`Drive Folder ID: ${folderId}`);
    
    try {
      execSync('which rclone', { stdio: 'ignore' });
      logger.info(`Using rclone to download images...`);
      
      const rcloneCommand = `rclone copy "gdrive:" "${targetFolder}" --drive-root-folder-id=${folderId} --progress`;
      
      try {
        const output = execSync(rcloneCommand, { encoding: 'utf-8', stdio: 'pipe' });
        logger.info(output);
        
        const files = fs.readdirSync(targetFolder);
        if (files.length > 0) {
          logger.success(`Downloaded ${files.length} files using rclone`);
          return true;
        } else {
          logger.warn(`rclone completed but no files downloaded`);
          return false;
        }
      } catch (rcloneError: any) {
        logger.warn(`rclone failed: ${rcloneError.message}`);
        logger.warn(`Make sure rclone is configured with 'gdrive' remote`);
        logger.warn(`Run: rclone config`);
        return false;
      }
      
    } catch {
      logger.warn(`rclone not found. Trying alternative methods...`);
    }
    
    const gdrivePath = path.join(process.env.HOME || '', 'Google Drive', 'My Drive');
    if (fs.existsSync(gdrivePath)) {
      logger.info(`Found local Google Drive mount at: ${gdrivePath}`);
      logger.info(`Searching for folder ID: ${folderId}`);
      
      const findCommand = `find "${gdrivePath}" -type d -name "*${folderId}*" 2>/dev/null | head -1`;
      
      try {
        const foundPath = execSync(findCommand, { encoding: 'utf-8' }).trim();
        
        if (foundPath && fs.existsSync(foundPath)) {
          logger.info(`Found Drive folder locally: ${foundPath}`);
          
          const imageFiles = fs.readdirSync(foundPath)
            .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
          
          if (imageFiles.length > 0) {
            logger.info(`Copying ${imageFiles.length} images...`);
            
            imageFiles.forEach(file => {
              const sourcePath = path.join(foundPath, file);
              const destPath = path.join(targetFolder, file);
              fs.copyFileSync(sourcePath, destPath);
            });
            
            logger.success(`Copied ${imageFiles.length} images from local Drive`);
            return true;
          }
        }
      } catch (findError) {
        logger.warn(`Could not locate folder in local Drive mount`);
      }
    }
    
    logger.warn(`Unable to download images automatically`);
    logger.warn(`Please download manually from: ${driveLink}`);
    logger.warn(`Then place in: ${targetFolder}/`);
    return false;
    
  } catch (error: any) {
    logger.error(`Error downloading images: ${error.message}`);
    return false;
  }
}

async function uploadImageToS3(imagePath: string, originalFilename: string): Promise<{ key: string; url: string; alt: string }> {
  const fileNameWithoutExt = path.basename(originalFilename, path.extname(originalFilename));
  const webpFilename = `${fileNameWithoutExt}.webp`;
  
  try {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    logger.info(`    → Converting image to WebP format...`);
    const webpBuffer = await sharp(imagePath)
      .webp({ quality: 75 })
      .toBuffer();
    
    const contentType = 'image/webp';

    logger.info(`    → Requesting presigned URL for: ${webpFilename}`);
    logger.info(`    → API: ${API_BASE_URL}/files/presigned-url`);
    logger.info(`    → Content-Type: ${contentType}`);

    let presignedResponse;
    try {
      presignedResponse = await axios.post(`${API_BASE_URL}/files/presigned-url`, {
        filename: webpFilename,
        contentType: contentType,
      });
      
      logger.info(`    → Presigned URL received successfully`);
    } catch (presignedError: any) {
      logger.error(`    → Presigned URL request failed!`);
      logger.error(`    → Status: ${presignedError.response?.status}`);
      logger.error(`    → Status Text: ${presignedError.response?.statusText}`);
      logger.error(`    → Response Data: ${JSON.stringify(presignedError.response?.data)}`);
      logger.error(`    → Error Message: ${presignedError.message}`);
      throw new Error(`Failed to get presigned URL: ${presignedError.message}`);
    }

    const { uploadUrl, key, finalUrl } = presignedResponse.data;
    
    logger.info(`    → Upload URL: ${uploadUrl.substring(0, 100)}...`);
    logger.info(`    → Final Key: ${key}`);

    try {
      await axios.put(uploadUrl, webpBuffer, {
        headers: {
          'Content-Type': contentType,
        },
      });
      
      logger.info(`    → Upload to S3 successful`);
    } catch (uploadError: any) {
      logger.error(`    → S3 upload failed!`);
      logger.error(`    → Status: ${uploadError.response?.status}`);
      logger.error(`    → Error: ${uploadError.message}`);
      throw new Error(`Failed to upload to S3: ${uploadError.message}`);
    }

    return {
      key: key,
      url: key,
      alt: webpFilename,
    };
  } catch (error: any) {
    logger.error(`Failed to upload image ${webpFilename}: ${error.message}`);
    throw error;
  }
}

async function processImages(driveLink: string, skuCode: string, imagesFolder: string): Promise<Array<{ url: string; alt: string }>> {
  const images: Array<{ url: string; alt: string }> = [];
  
  const productImagesPath = path.join(imagesFolder, skuCode);
  
  if (!fs.existsSync(productImagesPath) || fs.readdirSync(productImagesPath).length === 0) {
    logger.info(`Attempting to download images for SKU ${skuCode}...`);
    const downloaded = await downloadImagesFromDrive(driveLink, skuCode, imagesFolder);
    
    if (!downloaded) {
      logger.warn(`Image folder not found or empty for SKU ${skuCode}: ${productImagesPath}`);
      logger.warn(`Please download images from: ${driveLink}`);
      return [];
    }
  }
  
  const imageFiles = fs.readdirSync(productImagesPath)
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort();
  
  if (imageFiles.length === 0) {
    logger.warn(`No images found in folder: ${productImagesPath}`);
    return [];
  }
  
  logger.info(`Found ${imageFiles.length} images for SKU ${skuCode}`);
  
  for (const imageFile of imageFiles) {
    const imagePath = path.join(productImagesPath, imageFile);
    
    try {
      const uploadedImage = await uploadImageToS3(imagePath, imageFile);
      images.push({
        url: uploadedImage.url,
        alt: uploadedImage.alt,
      });
      logger.info(`  ✓ Uploaded: ${imageFile}`);
    } catch (error: any) {
      logger.error(`  ✗ Failed to upload: ${imageFile} - ${error.message}`);
    }
  }
  
  return images;
}

function processRow(row: CSVRow): ProcessedProduct {
  const skuCode = row['Sku Code'].trim();
  const skuName = row['Sku Name'].trim();
  const newMRP = parseFloat(row['New MRP'].trim());
  const newGrammage = parseFloat(row['New Grammage'].trim());
  const newEAN = row['New EAN'].trim();
  const ingredients = row['Ingredients'].trim();
  const category = row['catgeory'].trim();
  const allergens = row['allergens ']?.trim() || GENERIC_ALLERGENS;
  const length = parseFloat(row['Length'].trim());
  const breadth = parseFloat(row['breadth'].trim());
  const height = parseFloat(row['Height'].trim());
  const shelfLife = row['shelf life']?.trim() 
    ? `${row['shelf life'].trim()} Days` 
    : `${DEFAULT_SHELF_LIFE_DAYS} Days`;

  const price = Math.round(newMRP * (1 - DISCOUNT_PERCENT / 100));
  const packageSize = `${newGrammage}g`;
  
  const productNameWithoutWeight = skuName.replace(/\d+\s*(g|gm|gms|kg|ml|l|Gm|Gms)$/i, '').trim();
  const slug = generateSlug(productNameWithoutWeight);
  
  const variantName = productNameWithoutWeight;

  return {
    name: productNameWithoutWeight,
    slug: slug,
    brand: "Let's Try",
    gtin: newEAN,
    categoryIds: [],
    currency: 'INR',
    ingredients: ingredients,
    allergens: allergens,
    shelfLife: shelfLife,
    isVegetarian: true,
    isGlutenFree: false,
    keywords: [],
    tags: [],
    description: '',
    ratingCount: 0,
    isArchived: false,
    variants: [{
      sku: skuCode,
      name: variantName,
      mrp: newMRP,
      price: price,
      discountPercent: DISCOUNT_PERCENT,
      discountSource: 'product',
      weight: newGrammage,
      weightUnit: 'g',
      packageSize: packageSize,
      length: length,
      height: height,
      breadth: breadth,
      stockQuantity: DEFAULT_STOCK,
      availabilityStatus: 'in_stock',
      images: [],
      thumbnailUrl: '',
      isDefault: true,
      isActive: true,
    }],
  };
}

async function importProducts(csvPath: string, imagesFolder: string, options: { devMode?: boolean; limit?: number; dryRun?: boolean; skip?: number } = {}) {
  const { devMode = false, limit, dryRun = false, skip = 0 } = options;
  
  logger.info('='.repeat(60));
  logger.info('Starting CSV Product Import');
  logger.info('='.repeat(60));
  logger.info(`CSV File: ${csvPath}`);
  logger.info(`Images Folder: ${imagesFolder}`);
  logger.info(`Dev Mode: ${devMode}`);
  logger.info(`Dry Run: ${dryRun}`);
  logger.info(`Skip: ${skip}, Limit: ${limit || 'All'}`);
  logger.info(`Discount: ${DISCOUNT_PERCENT}%`);
  logger.info('='.repeat(60));
  logger.info('');
  
  // Check if backend server is running
  logger.info('🔍 Checking backend server connection...');
  logger.info(`API Base URL: ${API_BASE_URL}`);
  try {
    const healthCheck = await axios.get(`${API_BASE_URL}/files/presigned-url`, {
      validateStatus: () => true // Accept any status
    });
    if (healthCheck.status === 404 || healthCheck.status === 405) {
      logger.warn('⚠️  Backend endpoint exists but might need POST method');
    } else if (healthCheck.status >= 500) {
      logger.error('❌ Backend server returned error!');
      logger.error(`Status: ${healthCheck.status}`);
      throw new Error('Backend server not healthy');
    }
    logger.success('✅ Backend server is reachable');
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      logger.error('❌ Cannot connect to backend server!');
      logger.error(`URL: ${API_BASE_URL}`);
      logger.error('');
      logger.error('Please start the backend server:');
      logger.error('  cd apps/backend');
      logger.error('  npm run dev');
      logger.error('');
      throw new Error('Backend server is not running');
    }
  }
  logger.info('');
  
  logger.info('📥 IMAGE DOWNLOAD SETUP:');
  logger.info('This script will attempt to download images automatically using:');
  logger.info('1. rclone (if configured with "gdrive" remote)');
  logger.info('2. Local Google Drive mount (if available)');
  logger.info('3. Falls back to manual download instructions');
  logger.info('');
  logger.info('To use rclone:');
  logger.info('  brew install rclone');
  logger.info('  rclone config');
  logger.info('  - Choose "New remote" -> name: gdrive -> type: drive');
  logger.info('');
  logger.info('='.repeat(60));
  logger.info('');
  
  const rows: CSVRow[] = [];
  
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row: CSVRow) => rows.push(row))
      .on('end', () => resolve())
      .on('error', (error) => reject(error));
  });
  
  logger.info(`Total rows in CSV: ${rows.length}`);
  
  const stats = {
    total: 0,
    valid: 0,
    skipped: 0,
    created: 0,
    failed: 0,
  };
  
  const skippedProducts: Array<{ row: number; name: string; reason: string }> = [];
  const failedProducts: Array<{ row: number; name: string; error: string }> = [];
  
  let processedCount = 0;
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowIndex = i + 2;
    
    if (processedCount < skip) {
      processedCount++;
      continue;
    }
    
    if (limit && stats.total >= limit) {
      logger.info(`Reached limit of ${limit} products`);
      break;
    }
    
    stats.total++;
    
    logger.info('');
    logger.info(`Processing Row ${rowIndex}: ${row['Sku Name']}`);
    
    const validation = isValidRow(row, rowIndex);
    
    if (!validation.valid) {
      logger.warn(`  ⚠️  SKIPPED - ${validation.reason}`);
      stats.skipped++;
      skippedProducts.push({
        row: rowIndex,
        name: row['Sku Name'] || 'Unknown',
        reason: validation.reason!,
      });
      continue;
    }
    
    stats.valid++;
    
    try {
      const productData = processRow(row);
      
      const categoryId = await getOrCreateCategory(row['catgeory'].trim());
      productData.categoryIds = [categoryId];
      
      const images = await processImages(row['Drive Link'].trim(), row['Sku Code'].trim(), imagesFolder);
      
      if (images.length > 0) {
        productData.variants[0].images = images;
        productData.variants[0].thumbnailUrl = images[0].url;
        logger.success(`  ✅ Uploaded ${images.length} images to S3`);
      } else {
        logger.warn(`  ⚠️  No images uploaded for this product`);
      }
      
      logger.info(`  Product Details:`);
      logger.info(`    - Name: ${productData.name}`);
      logger.info(`    - SKU: ${productData.variants[0].sku}`);
      logger.info(`    - MRP: ₹${productData.variants[0].mrp}`);
      logger.info(`    - Price: ₹${productData.variants[0].price} (${DISCOUNT_PERCENT}% off)`);
      logger.info(`    - Weight: ${productData.variants[0].weight}g`);
      logger.info(`    - Images: ${productData.variants[0].images.length}`);
      
      logger.info('');
      logger.info('  📦 Complete Product Schema:');
      logger.info('-'.repeat(60));
      logger.info(JSON.stringify(productData, null, 2));
      logger.info('-'.repeat(60));
      
      if (dryRun) {
        logger.info(`  [DRY RUN] Would create product: ${productData.name}`);
        stats.created++;
      } else {
        const existingProduct = await Product.findOne({ 
          $or: [
            { slug: productData.slug },
            { 'variants.sku': productData.variants[0].sku }
          ]
        });
        
        if (existingProduct) {
          logger.warn(`  ⚠️  Product already exists (slug: ${productData.slug} or SKU: ${productData.variants[0].sku})`);
          stats.skipped++;
          skippedProducts.push({
            row: rowIndex,
            name: productData.name,
            reason: 'Product already exists',
          });
          continue;
        }
        
        await Product.create(productData);
        logger.success(`  ✅ Product created successfully!`);
        stats.created++;
      }
      
    } catch (error: any) {
      logger.error(`  ❌ Failed to process: ${error.message}`);
      stats.failed++;
      failedProducts.push({
        row: rowIndex,
        name: row['Sku Name'] || 'Unknown',
        error: error.message,
      });
    }
  }
  
  logger.info('');
  logger.info('='.repeat(60));
  logger.info('IMPORT SUMMARY');
  logger.info('='.repeat(60));
  logger.info(`Total Rows Processed: ${stats.total}`);
  logger.info(`Valid Products: ${stats.valid}`);
  logger.info(`Skipped: ${stats.skipped}`);
  logger.info(`Successfully Created: ${stats.created}`);
  logger.info(`Failed: ${stats.failed}`);
  logger.info('='.repeat(60));
  
  if (skippedProducts.length > 0) {
    logger.info('');
    logger.info('SKIPPED PRODUCTS:');
    skippedProducts.forEach(item => {
      logger.warn(`  Row ${item.row}: ${item.name} - ${item.reason}`);
    });
  }
  
  if (failedProducts.length > 0) {
    logger.info('');
    logger.info('FAILED PRODUCTS:');
    failedProducts.forEach(item => {
      logger.error(`  Row ${item.row}: ${item.name} - ${item.error}`);
    });
  }
  
  const logFilePath = path.join(__dirname, `import-log-${Date.now()}.txt`);
  fs.writeFileSync(logFilePath, logger.getLogs().join('\n'));
  logger.info('');
  logger.info(`Full log saved to: ${logFilePath}`);
}

async function main() {
  const args = process.argv.slice(2);
  
  const devMode = args.includes('--dev');
  const dryRun = args.includes('--dry-run');
  const limitIndex = args.indexOf('--limit');
  const skipIndex = args.indexOf('--skip');
  const limit = limitIndex > -1 ? parseInt(args[limitIndex + 1]) : undefined;
  const skip = skipIndex > -1 ? parseInt(args[skipIndex + 1]) : 0;
  
  const csvPath = path.join(__dirname, '../../../file_a_swiggy_not_in_db - Missing Products.csv');
  const imagesFolder = path.join(__dirname, '../../../product-images');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`);
    process.exit(1);
  }
  
  if (!dryRun && !fs.existsSync(imagesFolder)) {
    console.warn(`Warning: Images folder not found: ${imagesFolder}`);
    console.warn(`Creating folder. Please organize images as: product-images/{SKU_CODE}/image1.jpg`);
    fs.mkdirSync(imagesFolder, { recursive: true });
  }
  
  try {
    await mongoose.connect(DATABASE_URL);
    logger.info('Connected to MongoDB');
    
    await importProducts(csvPath, imagesFolder, {
      devMode,
      limit: devMode ? 1 : limit,
      dryRun,
      skip,
    });
    
  } catch (error: any) {
    logger.error(`Fatal error: ${error.message}`);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

main();
