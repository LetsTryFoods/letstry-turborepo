import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.DATABASE_URL;
const dbName = process.env.DATABASE_NAME || 'letstry_dev';

if (!uri) {
    console.error('DATABASE_URL is not defined in .env or environment');
    process.exit(1);
}

const cloudfrontPattern = /https:\/\/[a-zA-Z0-9-]+\.cloudfront\.net\//g;

async function migrate() {
    try {
        const conn = await mongoose.connect(uri!);
        console.log('Connected to MongoDB via Mongoose');

        const db = conn.connection.db;
        if (!db) {
            throw new Error('Database object is not available after connection');
        }

        // 1. Products
        console.log('Migrating Products...');
        const products = db.collection('products');
        const productCursor = products.find({
            $or: [
                { 'variants.images.url': { $regex: 'cloudfront.net' } },
                { 'variants.thumbnailUrl': { $regex: 'cloudfront.net' } }
            ]
        });

        let productCount = 0;
        while (await productCursor.hasNext()) {
            const doc = await productCursor.next();
            if (!doc) continue;

            let changed = false;
            const variants = doc.variants.map((v: any) => {
                if (v.thumbnailUrl && typeof v.thumbnailUrl === 'string') {
                    const newUrl = v.thumbnailUrl.replace(cloudfrontPattern, '');
                    if (newUrl !== v.thumbnailUrl) {
                        v.thumbnailUrl = newUrl;
                        changed = true;
                    }
                }
                if (v.images && Array.isArray(v.images)) {
                    v.images = v.images.map((img: any) => {
                        if (img.url && typeof img.url === 'string') {
                            const newUrl = img.url.replace(cloudfrontPattern, '');
                            if (newUrl !== img.url) {
                                img.url = newUrl;
                                changed = true;
                            }
                        }
                        return img;
                    });
                }
                return v;
            });

            if (changed) {
                await products.updateOne({ _id: doc._id }, { $set: { variants } });
                productCount++;
            }
        }
        console.log(`Updated ${productCount} products.`);

        // 2. Categories
        console.log('Migrating Categories...');
        const categories = db.collection('categories');
        const categoryCursor = categories.find({
            $or: [
                { imageUrl: { $regex: 'cloudfront.net' } },
                { 'seo.ogImage': { $regex: 'cloudfront.net' } }
            ]
        });

        let categoryCount = 0;
        while (await categoryCursor.hasNext()) {
            const doc = await categoryCursor.next();
            if (!doc) continue;

            let changed = false;
            const updateData: any = {};

            if (doc.imageUrl && typeof doc.imageUrl === 'string') {
                const newUrl = doc.imageUrl.replace(cloudfrontPattern, '');
                if (newUrl !== doc.imageUrl) {
                    updateData.imageUrl = newUrl;
                    changed = true;
                }
            }

            if (doc.seo && doc.seo.ogImage && typeof doc.seo.ogImage === 'string') {
                const newUrl = doc.seo.ogImage.replace(cloudfrontPattern, '');
                if (newUrl !== doc.seo.ogImage) {
                    updateData['seo.ogImage'] = newUrl;
                    changed = true;
                }
            }

            if (changed) {
                await categories.updateOne({ _id: doc._id }, { $set: updateData });
                categoryCount++;
            }
        }
        console.log(`Updated ${categoryCount} categories.`);

        // 3. Banners
        console.log('Migrating Banners...');
        const banners = db.collection('banners');
        const bannerCursor = banners.find({
            $or: [
                { imageUrl: { $regex: 'cloudfront.net' } },
                { mobileImageUrl: { $regex: 'cloudfront.net' } },
                { thumbnailUrl: { $regex: 'cloudfront.net' } }
            ]
        });

        let bannerCount = 0;
        while (await bannerCursor.hasNext()) {
            const doc = await bannerCursor.next();
            if (!doc) continue;

            let changed = false;
            const updateData: any = {};

            ['imageUrl', 'mobileImageUrl', 'thumbnailUrl'].forEach(field => {
                if (doc[field] && typeof doc[field] === 'string') {
                    const newUrl = doc[field].replace(cloudfrontPattern, '');
                    if (newUrl !== doc[field]) {
                        updateData[field] = newUrl;
                        changed = true;
                    }
                }
            });

            if (changed) {
                await banners.updateOne({ _id: doc._id }, { $set: updateData });
                bannerCount++;
            }
        }
        console.log(`Updated ${bannerCount} banners.`);

        // 4. Packing Evidence
        console.log('Migrating Packing Evidence...');
        const packingEvidences = db.collection('packingevidences');
        const evidenceCursor = packingEvidences.find({
            $or: [
                { prePackImages: { $regex: 'cloudfront.net' } },
                { postPackImages: { $regex: 'cloudfront.net' } }
            ]
        });

        let evidenceCount = 0;
        while (await evidenceCursor.hasNext()) {
            const doc = await evidenceCursor.next();
            if (!doc) continue;

            let changed = false;
            const updateData: any = {};

            ['prePackImages', 'postPackImages'].forEach(field => {
                if (doc[field] && Array.isArray(doc[field])) {
                    const newArray = doc[field].map((url: string) => {
                        if (typeof url === 'string') {
                            const newUrl = url.replace(cloudfrontPattern, '');
                            if (newUrl !== url) {
                                changed = true;
                                return newUrl;
                            }
                        }
                        return url;
                    });
                    if (changed) {
                        updateData[field] = newArray;
                    }
                }
            });

            if (changed) {
                await packingEvidences.updateOne({ _id: doc._id }, { $set: updateData });
                evidenceCount++;
            }
        }
        console.log(`Updated ${evidenceCount} packing evidence records.`);

        // 5. Product SEO
        console.log('Migrating Product SEO...');
        const productseos = db.collection('productseos');
        const seoCursor = productseos.find({ ogImage: { $regex: 'cloudfront.net' } });

        let seoCount = 0;
        while (await seoCursor.hasNext()) {
            const doc = await seoCursor.next();
            if (!doc) continue;

            if (doc.ogImage && typeof doc.ogImage === 'string') {
                const newUrl = doc.ogImage.replace(cloudfrontPattern, '');
                if (newUrl !== doc.ogImage) {
                    await productseos.updateOne({ _id: doc._id }, { $set: { ogImage: newUrl } });
                    seoCount++;
                }
            }
        }
        console.log(`Updated ${seoCount} product SEO records.`);

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
