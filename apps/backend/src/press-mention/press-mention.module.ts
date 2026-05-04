import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PressMentionService } from './press-mention.service';
import { PressMentionResolver } from './press-mention.resolver';
import {
  PressMentionSchema,
  PRESS_MENTION_MODEL,
} from './press-mention.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PRESS_MENTION_MODEL, schema: PressMentionSchema },
    ]),
  ],
  providers: [PressMentionService, PressMentionResolver],
  exports: [PressMentionService],
})
export class PressMentionModule {}
