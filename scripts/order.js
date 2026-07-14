/**
 * confirmed-orders-collective-items-excel.js
 *
 * Ye script MongoDB se saare "CONFIRMED" orders nikalta hai, unke andar ke
 * saare items ko COMBINE karta hai (same product ki quantity sab orders
 * mein se jod ke), aur ek collective item-wise list bana ke
 * "confirmed-orders-collective-items.xlsx" file mein save karta hai.
 *
 * Run karne se pehle:
 *   npm install mongodb xlsx
 *
 * Run:
 *   node confirmed-orders-collective-items-excel.js
 */

const { MongoClient } = require("mongodb");
const XLSX = require("xlsx");
const path = require("path");

// ⚠️ Apna DB URL yahan daalo (ya env var MONGO_URL se lo)
const MONGO_URL =
    process.env.MONGO_URL ||
    "mongodb+srv://tech36701_db_user:VKQdIHX7klJ54dS3@cluster0.xxjj1uk.mongodb.net/letstry_dev?retryWrites=true&w=majority";

const DB_NAME = "letstry_dev";
const COLLECTION_NAME = "orders"; // collection ka naam alag hai to yahan change karo

const OUTPUT_FILE = path.join(__dirname, "confirmed-orders-collective-items.xlsx");

async function main() {
    const client = new MongoClient(MONGO_URL);

    try {
        await client.connect();
        console.log("✅ MongoDB se connect ho gaya");

        const db = client.db(DB_NAME);
        const ordersCollection = db.collection(COLLECTION_NAME);

        const confirmedOrders = await ordersCollection
            .find({ orderStatus: "CONFIRMED" })
            .toArray();

        console.log(`📦 Total CONFIRMED orders mile: ${confirmedOrders.length}`);

        // Key = variantId (ya sku/name fallback) -> { name, sku, totalQty, orderCount, totalRevenue }
        const itemMap = new Map();
        let grandTotalPieces = 0;

        confirmedOrders.forEach((order) => {
            const items = Array.isArray(order.items) ? order.items : [];

            items.forEach((item) => {
                const qty = Number(item.quantity) || 0;
                const price = Number(item.price) || 0;
                grandTotalPieces += qty;

                const key =
                    (item.variantId && item.variantId.$oid) ||
                    (item.variantId && item.variantId.toString()) ||
                    item.sku ||
                    item.name;

                if (!itemMap.has(key)) {
                    itemMap.set(key, {
                        name: item.name,
                        sku: item.sku || "N/A",
                        totalQty: 0,
                        orderCount: 0,
                        unitPrice: price,
                    });
                }

                const entry = itemMap.get(key);
                entry.totalQty += qty;
                entry.orderCount += 1;
            });
        });

        // Sort: sabse zyada quantity wala item sabse upar
        const sortedItems = Array.from(itemMap.values()).sort(
            (a, b) => b.totalQty - a.totalQty
        );

        // Excel rows banao
        const rows = sortedItems.map((item, idx) => ({
            "S.No": idx + 1,
            "Item Name": item.name,
            SKU: item.sku,
            "Total Quantity": item.totalQty,
            "Orders Count": item.orderCount,
            "Unit Price (₹)": item.unitPrice,
            "Total Value (₹)": item.unitPrice * item.totalQty,
        }));

        // Summary row bhi add kar do neeche
        rows.push({});
        rows.push({
            "S.No": "",
            "Item Name": "GRAND TOTAL",
            SKU: "",
            "Total Quantity": grandTotalPieces,
            "Orders Count": confirmedOrders.length,
            "Unit Price (₹)": "",
            "Total Value (₹)": "",
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);

        // Column widths set kar do taaki readable lage
        worksheet["!cols"] = [
            { wch: 6 },
            { wch: 45 },
            { wch: 16 },
            { wch: 14 },
            { wch: 12 },
            { wch: 14 },
            { wch: 16 },
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Collective Items");

        XLSX.writeFile(workbook, OUTPUT_FILE);

        console.log(`✅ Excel ban gayi: ${OUTPUT_FILE}`);
        console.log(`🔢 Grand Total Pieces: ${grandTotalPieces}`);
        console.log(`🔢 Distinct Items: ${sortedItems.length}`);
    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await client.close();
    }
}

main();