import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ContactWhatsAppService } from '../../contact/services/contact-whatsapp.service';
import { logWhatsAppEvent } from '../logger/whatsapp-file.logger';
import { MetaWhatsappService } from '../services/meta-whatsapp.service';
import { UploadService } from '../../upload/upload.service';


export interface WhatsAppInboundMessageJob {
  type: 'inbound_message';
  messageId: string;
  phone: string;
  text: string;
  timestamp: Date;
  msgType?: string;
  mediaId?: string;
}

export interface WhatsAppStatusUpdateJob {
  type: 'status_update';
  messageId: string;
  status: string;
  phone?: string;
}

export type WhatsAppInboundJobData = WhatsAppInboundMessageJob | WhatsAppStatusUpdateJob;

/**
 * Processes inbound WhatsApp webhook payloads from the queue.
 * The webhook controller enqueues payloads here and returns 200 immediately.
 * All heavy lifting (DB writes, socket emits) happens in this processor.
 *
 * Uses ModuleRef lazy-loading to avoid circular dependency with ContactModule.
 */
@Processor('whatsapp-inbound-queue')
@Injectable()
export class WhatsAppInboundProcessor extends WorkerHost {
  private readonly logger = new Logger(WhatsAppInboundProcessor.name);
  private contactWhatsAppService: ContactWhatsAppService;
  private uploadService: UploadService;
  private metaWhatsappService: MetaWhatsappService;

  constructor(private readonly moduleRef: ModuleRef) {
    super();
  }

  private async getServices() {
    if (!this.contactWhatsAppService) {
      this.contactWhatsAppService = await this.moduleRef.resolve(ContactWhatsAppService, undefined, { strict: false });
    }
    if (!this.uploadService) {
      this.uploadService = await this.moduleRef.resolve(UploadService, undefined, { strict: false });
    }
    if (!this.metaWhatsappService) {
      this.metaWhatsappService = await this.moduleRef.resolve(MetaWhatsappService, undefined, { strict: false });
    }
    return {
      service: this.contactWhatsAppService,
      upload: this.uploadService,
      meta: this.metaWhatsappService,
    };
  }

  async process(job: Job<WhatsAppInboundJobData>): Promise<void> {
    this.logger.log(`Processing inbound job [${job.name}] id=${job.id}`);
    logWhatsAppEvent(`Queue: Picked up job [${job.name}]`, { jobId: job.id, data: job.data });

    try {
      const { service, upload, meta } = await this.getServices();

      if (job.data.type === 'inbound_message') {
        const data = job.data as WhatsAppInboundMessageJob;
        let mediaUrl: string | undefined;

        if (data.mediaId) {
          try {
            logWhatsAppEvent('Queue: Downloading media from Meta', { mediaId: data.mediaId });
            const { buffer, mimeType } = await meta.downloadMedia(data.mediaId);
            const ext = mimeType.split('/')[1] || 'bin';
            const filename = `whatsapp_media_${data.messageId}.${ext}`;
            const key = `whatsapp/inbound/${filename}`;

            await upload.uploadFile(key, buffer, filename);
            
            // UploadService automatically converts images (except gifs) to .webp
            let finalKey = key;
            if (mimeType.startsWith('image/') && mimeType !== 'image/gif') {
              finalKey = key.replace(/\.[^.]+$/, '.webp');
            }
            
            mediaUrl = upload.getCloudFrontUrl(finalKey);
            logWhatsAppEvent('Queue: Uploaded media successfully', { mediaUrl });
          } catch (error) {
            this.logger.error(`Failed to handle media ${data.mediaId}`, error.stack);
            logWhatsAppEvent('Queue: Failed to download/upload media', { error: error.message });
          }
        }

        await service.handleInbound({
          messageId: data.messageId,
          phone: data.phone,
          text: data.text,
          timestamp: new Date(data.timestamp),
          type: data.msgType,
          mediaUrl,
        });
        logWhatsAppEvent('Queue: Successfully processed inbound message', { messageId: data.messageId });
      } else if (job.data.type === 'status_update') {
        const data = job.data as WhatsAppStatusUpdateJob;
        await service.handleStatusUpdate({
          messageId: data.messageId,
          status: data.status,
        });
        logWhatsAppEvent('Queue: Successfully processed status update', { messageId: data.messageId, status: data.status });
      } else {
        this.logger.warn(`Unknown inbound job type: ${(job.data as any).type}`);
        logWhatsAppEvent('Queue: Warning - Unknown job type', { type: (job.data as any).type });
      }
    } catch (err) {
      this.logger.error(`Failed to process inbound job ${job.id}: ${err.message}`, err.stack);
      logWhatsAppEvent('Queue: Error processing job', { jobId: job.id, error: err.message });
      throw err; // Re-throw so BullMQ handles retry/failure
    }
  }
}
