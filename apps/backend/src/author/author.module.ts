import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthorService } from './author.service';
import { AuthorResolver } from './author.resolver';
import { AuthorSchema, AUTHOR_MODEL } from './author.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AUTHOR_MODEL, schema: AuthorSchema }]),
  ],
  providers: [AuthorService, AuthorResolver],
  exports: [AuthorService],
})
export class AuthorModule {}
