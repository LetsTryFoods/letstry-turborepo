#!/usr/bin/env node
// warm-cache.js
const { MongoClient } = require('mongodb');

// Next.js image sizes configuration se match karte hue
const SIZES = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];
const BASE_URL = 'https://letstryfoods.com';

// R2 base URL - agar do buckets hain toh is logic ko update karna padh sakta hai.
const R2_BASE = 'https://pub-56a649c88d67403e867a9e00f3b37d78.r2.dev';

async function warmCache() {
  const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL;

  if (!mongoUri) {
    console.error("Error: MONGO_URI ya DATABASE_URL environment variable set nahi hai.");
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);
  await client.connect();

  // yaha 'letstry_dev' use kar rahe hain, DB_NAME env se bhi le sakte ho
  const dbName = process.env.DB_NAME || 'letstry_dev';
  const db = client.db(dbName);

  console.log(`Connected to MongoDB (${dbName}), fetching product images...`);

  const results = await db.collection('products').aggregate([
    { $match: { isArchived: { $ne: true } } },
    { $unwind: "$variants" },
    { $unwind: "$variants.images" },
    { $group: { _id: null, urls: { $addToSet: "$variants.images.url" } } }
  ]).toArray();

  const filenames = results[0]?.urls || [];
  console.log(`Found ${filenames.length} unique images to warm`);

  if (filenames.length === 0) {
    console.log("No images found. Exiting.");
    await client.close();
    return;
  }

  let count = 0;
  for (const filename of filenames) {
    const fullImageUrl = `${R2_BASE}/${filename}`;
    const encoded = encodeURIComponent(fullImageUrl);

    for (const size of SIZES) {
      const requestUrl = `${BASE_URL}/_next/image?url=${encoded}&w=${size}&q=75`;
      try {
        // Node 18+ has built-in fetch
        const res = await fetch(requestUrl);
        count++;
        if (count % 50 === 0) console.log(`Warmed ${count} requests...`);
      } catch (err) {
        console.error(`Failed to warm: ${filename} at w=${size} -> ${err.message}`);
      }
    }
  }

  await client.close();
  console.log(`Cache warming complete! Total successful requests: ${count}`);
}

warmCache().catch(console.error);
