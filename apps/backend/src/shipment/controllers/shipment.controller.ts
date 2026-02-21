import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { TrackingCronService } from '../services/tracking-cron.service';

@Controller('shipments')
export class ShipmentController {
    constructor(private readonly trackingCronService: TrackingCronService) {}

    @Post('trigger-tracking-sync')
    @HttpCode(HttpStatus.OK)
    async triggerTrackingSync(): Promise<{ message: string }> {
        await this.trackingCronService.triggerTrackingSync();
        return { message: 'Tracking sync job enqueued' };
    }
}
