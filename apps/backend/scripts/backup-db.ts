import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

dotenv.config({ path: path.join(__dirname, '../.env') });

const uri = process.env.DATABASE_URL;
const dbName = process.env.DATABASE_NAME || 'letstry_dev';
const desktopPath = path.join('/Users/apple/Desktop', 'backup');
const backupDir = path.join(desktopPath, `backup_${new Date().toISOString().replace(/[:.]/g, '-')}`);

if (!uri) {
    console.error('DATABASE_URL is not defined in .env or environment');
    process.exit(1);
}

async function backup() {
    console.log(`Starting backup for database: ${dbName}`);

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    try {
        // Attempt using mongodump first
        console.log('Attempting backup using mongodump...');
        try {
            execSync(`mongodump --uri="${uri}" --db=${dbName} --out="${backupDir}"`, { stdio: 'inherit' });
            console.log(`Backup completed successfully using mongodump. Files saved in: ${backupDir}`);
        } catch (dumpError) {
            console.warn('mongodump failed or is not installed. Falling back to manual collection export...');

            const conn = await mongoose.connect(uri!);
            console.log('Connected to MongoDB via Mongoose');

            const db = conn.connection.db;
            if (!db) {
                throw new Error('Database object is not available after connection');
            }

            const collections = await db.listCollections().toArray();
            console.log(`Found ${collections.length} collections.`);

            for (const collectionInfo of collections) {
                const collectionName = collectionInfo.name;
                // Skip system collections
                if (collectionName.startsWith('system.')) continue;

                console.log(`Backing up collection: ${collectionName}`);
                const data = await db.collection(collectionName).find({}).toArray();
                const filePath = path.join(backupDir, `${collectionName}.json`);
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            }

            await mongoose.disconnect();
            console.log(`Manual backup completed. ${collections.length} collections exported as JSON to: ${backupDir}`);
        }
    } catch (error) {
        console.error('Backup failed:', error);
        process.exit(1);
    }
}

backup();
