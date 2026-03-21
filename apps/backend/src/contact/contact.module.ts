import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Contact, ContactSchema } from './contact.schema';
import { ContactService } from './services/contact.service';
import { ContactResolver } from './resolvers/contact.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }]),
  ],
  providers: [ContactService, ContactResolver],
  exports: [ContactService],
})
export class ContactModule {}
