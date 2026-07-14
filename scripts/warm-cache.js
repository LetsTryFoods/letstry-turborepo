#!/usr/bin/env node
// warm-cache.js
const { MongoClient } = require('mongodb');

// Next.js image sizes — next.config.ts se match karte hue
// imageSizes: listings/thumbnails ke liye
const IMAGE_SIZES = [16, 32, 48, 64, 96, 128, 256, 384];
// deviceSizes: full-width/hero/product detail ke liye
const DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
const SIZES = [...IMAGE_SIZES, ...DEVICE_SIZES]; // 16 sizes total

const BASE_URL = 'https://letstryfoods.com';
// Fallback agar DB mein sirf filename stored hai (full URL nahi)
const R2_FALLBACK = 'https://pub-56a649c88d67403e867a9e00f3b37d78.r2.dev';

// Ek saath kitne requests parallel chalenge
const CONCURRENCY = 20;

// Batch helper: array ko N parallel mein chalao
async function runBatch(tasks, concurrency) {
  let index = 0;
  let success = 0;
  let failed = 0;

  async function worker() {
    while (index < tasks.length) {
      const task = tasks[index++];
      const result = await task();
      if (result) success++; else failed++;
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return { success, failed };
}

async function warmCache() {
  const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL;

  if (!mongoUri) {
    console.error('Error: MONGO_URI ya DATABASE_URL environment variable set nahi hai.');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);
  await client.connect();

  const dbName = process.env.DB_NAME || 'letstry_dev';
  const db = client.db(dbName);
  console.log(`✅ Connected to MongoDB (${dbName}), fetching product images...`);

  const results = await db.collection('products').aggregate([
    { $match: { isArchived: { $ne: true } } },
    { $unwind: '$variants' },
    { $unwind: '$variants.images' },
    { $group: { _id: null, urls: { $addToSet: '$variants.images.url' } } }
  ]).toArray();

  await client.close();

  const filenames = results[0]?.urls || [];
  const totalRequests = filenames.length * SIZES.length;
  console.log(`📦 Found ${filenames.length} unique images × ${SIZES.length} sizes = ${totalRequests} requests`);
  console.log(`⚡ Running ${CONCURRENCY} concurrent requests...\n`);

  if (filenames.length === 0) {
    console.log('No images found. Exiting.');
    return;
  }

  // Saare tasks ek flat array mein
  let completed = 0;
  const tasks = [];

  for (const filename of filenames) {
    // DB mein full URL stored hai (https://cdn.krishnaseth.xyz/...) ya sirf path
    const fullImageUrl = filename.startsWith('http')
      ? filename
      : `${R2_FALLBACK}/${filename}`;
    const encoded = encodeURIComponent(fullImageUrl);

    for (const size of SIZES) {
      const requestUrl = `${BASE_URL}/_next/image?url=${encoded}&w=${size}&q=75`;
      tasks.push(async () => {
        try {
          await fetch(requestUrl, { signal: AbortSignal.timeout(15000) });
          completed++;
          if (completed % 500 === 0) {
            const pct = ((completed / totalRequests) * 100).toFixed(1);
            console.log(`  ⏳ ${completed}/${totalRequests} (${pct}%) warmed...`);
          }
          return true;
        } catch (err) {
          console.error(`  ❌ Failed: ${filename} w=${size} → ${err.message}`);
          completed++;
          return false;
        }
      });
    }
  }

  const startTime = Date.now();
  const { success, failed } = await runBatch(tasks, CONCURRENCY);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n🎉 Cache warming complete!`);
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Failed:  ${failed}`);
  console.log(`   ⏱️  Time:    ${elapsed}s`);
}

warmCache().catch(console.error);
