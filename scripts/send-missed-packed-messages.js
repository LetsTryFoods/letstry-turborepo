const { MongoClient } = require('mongodb');
const fetch = require('node-fetch');
require('dotenv').config({ path: '../apps/backend/.env' });

// Setup Meta credentials
const META_PHONE_ID = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
const META_TOKEN = process.env.META_WHATSAPP_ACCESS_TOKEN;
const MONGO_URL = process.env.MONGODB_CONNECTION_STRING || process.env.DATABASE_URL;
const DB_NAME = "letstry_dev";

async function sendMetaMessage(phone, name, orderId) {
    if (!META_PHONE_ID || !META_TOKEN) {
        console.error("Meta credentials missing!");
        return false;
    }

    const to = phone.startsWith('91') ? phone : `91${phone}`;
    const url = `https://graph.facebook.com/v21.0/${META_PHONE_ID}/messages`;

    const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
            name: 'ordershipped',
            language: { code: 'en_US' },
            components: [
                {
                    type: 'body',
                    parameters: [
                        { type: 'text', text: name || 'Customer' },
                        { type: 'text', text: orderId }
                    ]
                }
            ]
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${META_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (data.error) {
            console.error(`❌ Failed for ${to}:`, data.error.message);
            return false;
        }
        console.log(`✅ Sent successfully to ${to} (Order: ${orderId})`);

        // --- LOG TO DATABASE ---
        if (db) {
            await db.collection('baileysmessagelogs').insertOne({
                phoneNumber: phone, // Save original phone number without extra 91
                recipientName: name || 'Customer',
                orderId: orderId,
                channel: 'META',
                templateName: 'ordershipped',
                status: 'SUCCESS',
                primaryAttempted: true,
                primarySuccess: true,
                fallbackAttempted: false,
                fallbackSuccess: false,
                payload: { phoneNumber: phone, recipientName: name || 'Customer', orderId },
                sentAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log(`   📝 Logged to database for ${orderId}`);
        }

        return true;
    } catch (err) {
        console.error(`❌ Network error for ${to}:`, err.message);
        return false;
    }
}

async function main() {
    if (!MONGO_URL) {
        console.error("❌ Missing MongoDB Connection String");
        process.exit(1);
    }

    const client = new MongoClient(MONGO_URL);

    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");
        const db = client.db(DB_NAME);

        // Find orders packed today
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        console.log(`🔍 Searching for orders packed since ${startOfToday.toISOString()}`);

        const packedOrders = await db.collection("orders").find({
            orderStatus: "PACKED",
            updatedAt: { $gte: startOfToday }
        }).toArray();

        console.log(`📦 Found ${packedOrders.length} orders packed today.`);

        let successCount = 0;
        let failCount = 0;

        for (const order of packedOrders) {
            const phone = order.identity?.phoneNumber || order.placerContact?.phone;
            const name = order.identity?.name || order.placerContact?.firstName || 'Customer';
            const orderId = order.orderId || order._id.toString();

            if (!phone) {
                console.log(`⚠️ No phone number for order ${orderId}, skipping.`);
                failCount++;
                continue;
            }

            const success = await sendMetaMessage(phone, name, orderId, db);
            if (success) {
                successCount++;
            } else {
                failCount++;
            }

            // Wait 200ms between messages to avoid rate limits
            await new Promise(res => setTimeout(res, 200));
        }

        console.log(`\n🎉 Finished processing!`);
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Failed/Skipped: ${failCount}`);

    } catch (err) {
        console.error("❌ Fatal Error:", err);
    } finally {
        await client.close();
        console.log("🔌 Database connection closed.");
    }
}

main();
