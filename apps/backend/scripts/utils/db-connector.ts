import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try to load .env first, then .env.development
const envPath = path.resolve(__dirname, '../../.env');
const devEnvPath = path.resolve(__dirname, '../../.env.development');

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else if (fs.existsSync(devEnvPath)) {
    dotenv.config({ path: devEnvPath });
} else {
    console.warn('No .env or .env.development file found in backend directory');
}

export const connectDB = async () => {
    const uri = process.env.DATABASE_URL || 'mongodb://admin:password@localhost:27017/letstry_dev?authSource=admin';

    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};

export const disconnectDB = async () => {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
};
