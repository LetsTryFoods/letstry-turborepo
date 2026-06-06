import { Module } from '@nestjs/common';
import { DataExportService } from './data-export.service';
import { DataExportController } from './data-export.controller';
import { UserModule } from '../user/user.module';
import { ContactModule } from '../contact/contact.module';

@Module({
  imports: [UserModule, ContactModule],
  controllers: [DataExportController],
  providers: [DataExportService],
  exports: [DataExportService],
})
export class DataExportModule {}
