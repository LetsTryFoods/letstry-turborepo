
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.development') });

async function test() {
    console.log('Testing Cloudflare R2 signature logic...');
    
    const s3Client = new S3Client({
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT,
        forcePathStyle: true,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
    });

    const bucketName = process.env.BUCKET_NAME!;
    const key = 'test-file.png';
    
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: 'image/png',
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    console.log('\n--- VERIFICATION ---');
    console.log('Endpoint:', process.env.R2_ENDPOINT);
    console.log('Bucket:', bucketName);
    console.log('Generated Presigned URL:', url);
    
    if (url.includes('r2.cloudflarestorage.com') && url.includes(bucketName)) {
        console.log('\n✅ SUCCESS: logic verified.');
    } else {
        console.log('\n❌ FAILURE: Check configuration.');
    }
}

test().catch(console.error);
