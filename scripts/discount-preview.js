const { MongoClient } = require("mongodb");

const MONGO_URI =
  "mongodb+srv://tech36701_db_user:VKQdIHX7klJ54dS3@cluster0.xxjj1uk.mongodb.net/";

async function main() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log("\n✅ Connected to MongoDB\n");

    // Step 1: List all databases
    const { databases } = await client.db("admin").admin().listDatabases();
    console.log("📂 Available databases:");
    databases.forEach((d) => console.log(`   • ${d.name}`));

    // Step 2: Find which DB has 'products' collection
    console.log("\n🔍 Looking for 'products' collection...\n");

    for (const dbInfo of databases) {
      if (["admin", "local", "config"].includes(dbInfo.name)) continue;

      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      const names = collections.map((c) => c.name);

      if (names.includes("products")) {
        const count = await db.collection("products").countDocuments({});
        console.log(`✅ Found 'products' in DB: "${dbInfo.name}" — ${count} total documents\n`);

        // Show discount distribution
        const result = await db.collection("products").aggregate([
          { $unwind: "$variants" },
          {
            $group: {
              _id: "$variants.discountPercent",
              variantCount: { $sum: 1 },
              productCount: { $addToSet: "$_id" },
              avgMRP: { $avg: "$variants.mrp" },
              avgPrice: { $avg: "$variants.price" },
            },
          },
          { $sort: { _id: 1 } },
        ]).toArray();

        console.log("📊 Discount Distribution:\n");
        console.log(
          "Discount%".padEnd(12) +
          "Variants".padEnd(12) +
          "Products".padEnd(12) +
          "Avg MRP".padEnd(12) +
          "Avg Price"
        );
        console.log("─".repeat(62));

        for (const row of result) {
          const disc = String(row._id ?? "null").padEnd(12);
          const variants = String(row.variantCount).padEnd(12);
          const prods = String(row.productCount.length).padEnd(12);
          const mrp = ("₹" + Math.round(row.avgMRP)).padEnd(12);
          const price = "₹" + Math.round(row.avgPrice);
          console.log(`${disc}${variants}${prods}${mrp}${price}`);
        }

        const total = result.reduce((s, r) => s + r.variantCount, 0);
        console.log("─".repeat(62));
        console.log(`Total variants: ${total}`);

        // Sample product
        const sample = await db.collection("products").findOne(
          {},
          { projection: { name: 1, "variants.name": 1, "variants.discountPercent": 1, "variants.price": 1, "variants.mrp": 1 } }
        );
        console.log("\n📝 Sample product:");
        console.log(JSON.stringify(sample, null, 2));
      }
    }

    console.log("\n💡 Run: node scripts/discount-update.js --from=30 --to=2 --dry-run\n");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.close();
  }
}

main();
