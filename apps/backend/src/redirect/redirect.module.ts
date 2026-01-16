import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedirectService } from './redirect.service';
import { RedirectResolver } from './redirect.resolver';
import { Redirect, RedirectSchema } from './redirect.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Redirect.name, schema: RedirectSchema },
    ]),
  ],
  providers: [RedirectService, RedirectResolver],
  exports: [RedirectService],
})
export class RedirectModule {}
