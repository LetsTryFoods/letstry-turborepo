
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UploadService } from '../src/upload/upload.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const uploadService = app.get(UploadService);

    console.log('Testing R2 Presigned URL Generation...');
    try {
        const testData = await uploadService.generatePresignedUploadData('test-image.png', 'image/png');
        console.log('--- GENERARED DATA ---');
        console.log('Upload URL:', testData.uploadUrl);
        console.log('Final URL:', testData.finalUrl);
        console.log('Base URL:', testData.baseUrl);
        
        if (testData.uploadUrl.includes('r2.cloudflarestorage.com') && testData.uploadUrl.includes('cdn-bucket-main')) {
            console.log('\n✅ SUCCESS: Presigned URL is correctly pointing to Cloudflare R2.');
        } else {
            console.log('\n❌ FAILURE: Presigned URL is incorrect.');
        }
    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
