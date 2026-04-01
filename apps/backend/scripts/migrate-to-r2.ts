import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.development') });

const uri = process.env.DATABASE_URL;
const dbName = process.env.DATABASE_NAME || 'letstry_dev';
const r2PublicUrl = process.env.AWS_CLOUDFRONT_DOMAIN!.replace(/\/$/, '');

if (!uri) {
    console.error('DATABASE_URL is not defined');
    process.exit(1);
}

if (!r2PublicUrl) {
    console.error('AWS_CLOUDFRONT_DOMAIN is not defined');
    process.exit(1);
}

const oldPattern = /https:\/\/[a-zA-Z0-9-]+\.cloudfront\.net\//g;

function replaceUrl(url: string): { newUrl: string; changed: boolean } {
    if (!url || typeof url !== 'string') return { newUrl: url, changed: false };
    if (url.startsWith('https://') && !url.includes('cloudfront.net')) return { newUrl: url, changed: false };
    const bare = url.replace(oldPattern, '');
    const newUrl = bare.startsWith('http') ? bare : `${r2PublicUrl}/${bare}`;
    return { newUrl, changed: newUrl !== url };
}

async function migrate() {
    const conn = await mongoose.connect(uri!);
    const db = conn.connection.db!;

    let total = 0;

    const products = db.collection('products');
    const productCursor = products.find({
        $or: [
            { 'variants.images.url': { $regex: 'cloudfront.net' } },
            { 'variants.thumbnailUrl': { $regex: 'cloudfront.net' } },
        ],
    });
    let count = 0;
    while (await productCursor.hasNext()) {
        const doc = await productCursor.next();
        if (!doc) continue;
        let changed = false;
        const variants = doc.variants.map((v: any) => {
            const t = replaceUrl(v.thumbnailUrl);
            if (t.changed) { v.thumbnailUrl = t.newUrl; changed = true; }
            if (v.images && Array.isArray(v.images)) {
                v.images = v.images.map((img: any) => {
                    const r = replaceUrl(img.url);
                    if (r.changed) { img.url = r.newUrl; changed = true; }
                    return img;
                });
            }
            return v;
        });
        if (changed) {
            await products.updateOne({ _id: doc._id }, { $set: { variants } });
            count++;
        }
    }
    console.log(`Products updated: ${count}`);
    total += count;

    const categories = db.collection('categories');
    const categoryCursor = categories.find({
        $or: [
            { imageUrl: { $regex: 'cloudfront.net' } },
            { 'seo.ogImage': { $regex: 'cloudfront.net' } },
        ],
    });
    count = 0;
    while (await categoryCursor.hasNext()) {
        const doc = await categoryCursor.next();
        if (!doc) continue;
        let changed = false;
        const updateData: any = {};
        const i = replaceUrl(doc.imageUrl);
        if (i.changed) { updateData.imageUrl = i.newUrl; changed = true; }
        if (doc.seo?.ogImage) {
            const s = replaceUrl(doc.seo.ogImage);
            if (s.changed) { updateData['seo.ogImage'] = s.newUrl; changed = true; }
        }
        if (changed) {
            await categories.updateOne({ _id: doc._id }, { $set: updateData });
            count++;
        }
    }
    console.log(`Categories updated: ${count}`);
    total += count;

    const banners = db.collection('banners');
    const bannerCursor = banners.find({
        $or: [
            { imageUrl: { $regex: 'cloudfront.net' } },
            { mobileImageUrl: { $regex: 'cloudfront.net' } },
            { thumbnailUrl: { $regex: 'cloudfront.net' } },
        ],
    });
    count = 0;
    while (await bannerCursor.hasNext()) {
        const doc = await bannerCursor.next();
        if (!doc) continue;
        let changed = false;
        const updateData: any = {};
        for (const field of ['imageUrl', 'mobileImageUrl', 'thumbnailUrl']) {
            const r = replaceUrl(doc[field]);
            if (r.changed) { updateData[field] = r.newUrl; changed = true; }
        }
        if (changed) {
            await banners.updateOne({ _id: doc._id }, { $set: updateData });
            count++;
        }
    }
    console.log(`Banners updated: ${count}`);
    total += count;

    const productseos = db.collection('productseos');
    const seoCursor = productseos.find({ ogImage: { $regex: 'cloudfront.net' } });
    count = 0;
    while (await seoCursor.hasNext()) {
        const doc = await seoCursor.next();
        if (!doc) continue;
        const r = replaceUrl(doc.ogImage);
        if (r.changed) {
            await productseos.updateOne({ _id: doc._id }, { $set: { ogImage: r.newUrl } });
            count++;
        }
    }
    console.log(`Product SEO updated: ${count}`);
    total += count;

    console.log(`\nTotal records updated: ${total}`);
    await mongoose.disconnect();
}

migrate().catch((e) => {
    console.error(e);
    process.exit(1);
});
