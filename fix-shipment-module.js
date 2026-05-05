const fs = require('fs');
const filePath = '/Users/apple/letstry-turborepo/apps/backend/src/shipment/shipment.module.ts';
let code = fs.readFileSync(filePath, 'utf-8');

// Add imports
const importsToAdd = `
import { PickupLocation, PickupLocationSchema } from './entities/pickup-location.entity';
import { DeliveryPartnerFactory } from './core/factories/delivery-partner.factory';
import { DtdcAdapter } from './adapters/dtdc/dtdc.adapter';
import { ShiprocketAdapter } from './adapters/shiprocket/shiprocket.adapter';
import { ShiprocketApiService } from './providers/shiprocket/shiprocket-api.service';
import { ShiprocketAuthService } from './providers/shiprocket/shiprocket-auth.service';
import { ShiprocketMapper } from './adapters/shiprocket/shiprocket.mapper';
import { ShiprocketWebhookController } from './controllers/shiprocket-webhook.controller';
import { ShiprocketWebhookAuthGuard } from './guards/shiprocket-webhook-auth.guard';
import { CacheModule } from '../cache/cache.module';
`;

code = code.replace(/import { Module/, importsToAdd + '\nimport { Module');

// Mongoose features
code = code.replace(/\{ name: OrderTrackingAnalytics\.name, schema: OrderTrackingAnalyticsSchema \},/, 
`{ name: OrderTrackingAnalytics.name, schema: OrderTrackingAnalyticsSchema },
      { name: PickupLocation.name, schema: PickupLocationSchema },`);

// Controllers
code = code.replace(/controllers: \[DtdcWebhookController, ShipmentController\],/,
`controllers: [DtdcWebhookController, ShipmentController, ShiprocketWebhookController],`);

// Providers
code = code.replace(/providers: \[/,
`providers: [
    DeliveryPartnerFactory,
    DtdcAdapter,
    ShiprocketAdapter,
    ShiprocketApiService,
    ShiprocketAuthService,
    ShiprocketMapper,
    ShiprocketWebhookAuthGuard,`);

// CacheModule
code = code.replace(/forwardRef\(\(\) => OrderModule\),/g, 
  `forwardRef(() => OrderModule),\n    CacheModule,`);

fs.writeFileSync(filePath, code, 'utf-8');
console.log('shipment module updated');
