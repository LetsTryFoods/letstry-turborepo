import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFiles,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import * as crypto from 'crypto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('files')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Get('url/:key')
  async getPresignedUrl(@Param('key') key: string) {
    const url = await this.uploadService.getPresignedUrl(key);
    return { url };
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFile(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const filename = file.originalname;
        const uid = crypto.randomBytes(16).toString('hex');
        const extension = filename.includes('.')
          ? filename.substring(filename.lastIndexOf('.'))
          : '';
        const key = `${uid}${extension}`;

        await this.uploadService.uploadFile(key, file.buffer, filename);
        const finalKey =
          this.uploadService.isImageFile(file.mimetype) &&
            file.mimetype !== 'image/gif' &&
            !filename.toLowerCase().endsWith('.webp')
            ? key.replace(/\.[^.]+$/, '.webp')
            : key;

        const url = this.uploadService.getCloudFrontUrl(finalKey);

        return {
          key: finalKey,
          url,
          originalName: filename,
        };
      }),
    );

    return {
      files: uploadedFiles,
    };
  }
 @Public()
  @Post('presigned-url')
  async getPresignedUploadUrl(
    @Body() body: { filename: string; contentType?: string },
  ) {
    return this.uploadService.generatePresignedUploadData(
      body.filename,
      body.contentType,
    );
  }
}
