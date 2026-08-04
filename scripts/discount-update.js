/**
 * Bulk Discount Update Script
 * DB: letstry_dev
 *
 * Usage:
 *   node scripts/discount-update.js --to=20              (ALL products → 20%)
 *   node scripts/discount-update.js --from=30 --to=20   (only 30% → 20%)
 *   node scripts/discount-update.js --to=20 --dry-run   (preview only)
 *
 * price = Math.round(mrp × (1 - to/100))
 */

const { MongoClient } = require("mongodb");

const MONGO_URI =
  "mongodb+srv://tech36701_db_user:VKQdIHX7klJ54dS3@cluster0.xxjj1uk.mongodb.net/";
const DB_NAME = "letstry_dev";

// ── Parse CLI args ────────────────────────────────────────────────────────────
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [k, v] = arg.replace("--", "").split("=");
  acc[k] = v;
  return acc;
}, {});

const TO_DISCOUNT = parseFloat(args.to);
const FROM_DISCOUNT = args.from !== undefined ? parseFloat(args.from) : null;
const DRY_RUN = "dry-run" in args;

if (isNaN(TO_DISCOUNT)) {
  console.error("\n❌ Usage: node scripts/discount-update.js --to=20 [--from=30] [--dry-run]\n");
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const col = db.collection("products");

    const multiplier = 1 - TO_DISCOUNT / 100;

    console.log("\n✅ Connected to MongoDB | DB:", DB_NAME);
    console.log(`\n🎯 Target discount: ${TO_DISCOUNT}%`);
    console.log(`📐 New price = round(MRP × ${multiplier.toFixed(4)})`);
    if (FROM_DISCOUNT !== null)
      console.log(`🔍 Only updating variants where discountPercent = ${FROM_DISCOUNT}%`);
    else
      console.log("🔍 Updating ALL variants regardless of current discount");
    if (DRY_RUN)
      console.log("🔍 DRY RUN — no changes will be saved");
    else
      console.log("⚡ LIVE MODE — changes WILL be saved to DB");

    // Build filter — skip "sample" products
    const filter =
      FROM_DISCOUNT !== null
        ? { "variants.discountPercent": FROM_DISCOUNT, name: { $not: /sample/i } }
        : { name: { $not: /sample/i } };

    const products = await col.find(filter).toArray();
    console.log(`\n📦 Products to process: ${products.length}\n`);

    if (products.length === 0) {
      console.log("⚠️  Nothing to update.");
      return;
    }

    // Print header
    console.log(
      "Product".padEnd(32) +
      "Variant".padEnd(24) +
      "MRP".padEnd(8) +
      "Old Price".padEnd(12) +
      "New Price".padEnd(12) +
      "Old Disc%".padEnd(12) +
      "New Disc%"
    );
    console.log("─".repeat(105));

    let totalVariants = 0;
    const bulkOps = [];

    for (const product of products) {
      const updatedVariants = product.variants.map((v) => {
        // Skip if FROM_DISCOUNT specified and doesn't match
        if (FROM_DISCOUNT !== null && v.discountPercent !== FROM_DISCOUNT) {
          return v;
        }

        const newPrice = Math.round(v.mrp * multiplier);
        const oldDisc = v.discountPercent;

        const pName = (product.name || "").substring(0, 30).padEnd(32);
        const vName = (v.name || v.sku || "").substring(0, 22).padEnd(24);
        const mrp = ("₹" + v.mrp).padEnd(8);
        const oldP = ("₹" + v.price).padEnd(12);
        const newP = ("₹" + newPrice).padEnd(12);
        const oldD = (String(oldDisc) + "%").padEnd(12);
        const newD = TO_DISCOUNT + "%";

        console.log(`${pName}${vName}${mrp}${oldP}${newP}${oldD}${newD}`);
        totalVariants++;

        return { ...v, discountPercent: TO_DISCOUNT, price: newPrice };
      });

      if (!DRY_RUN) {
        bulkOps.push({
          updateOne: {
            filter: { _id: product._id },
            update: { $set: { variants: updatedVariants } },
          },
        });
      }
    }

    console.log("─".repeat(105));
    console.log(`\n📊 Summary: ${totalVariants} variants across ${products.length} products`);

    if (!DRY_RUN && bulkOps.length > 0) {
      const result = await col.bulkWrite(bulkOps);
      console.log(`\n✅ Done! Modified ${result.modifiedCount} products in database.\n`);
    } else {
      console.log("\n✅ Dry run complete. Run without --dry-run to apply.\n");
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.close();
  }
}

main();
