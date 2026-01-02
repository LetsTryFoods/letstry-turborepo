import { Module, Global } from '@nestjs/common';
import { SlugService } from './services/slug.service';
import { PaymentLoggerService } from './services/payment-logger.service';

@Global()
@Module({
  providers: [SlugService, PaymentLoggerService],
  exports: [SlugService, PaymentLoggerService],
})
export class CommonModule {}
