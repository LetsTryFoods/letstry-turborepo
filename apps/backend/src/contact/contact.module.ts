import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Contact, ContactSchema } from './contact.schema';
import { ContactService } from './services/contact.service';
import { ContactWhatsAppService } from './services/contact-whatsapp.service';
import { ContactResolver } from './resolvers/contact.resolver';
import { ContactWhatsAppController } from './contact-whatsapp.controller';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import {
  WhatsAppChat,
  WhatsAppChatSchema,
} from '../whatsapp/schemas/whatsapp-chat.schema';
import {
  WhatsAppMessage,
  WhatsAppMessageSchema,
} from '../whatsapp/schemas/whatsapp-message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contact.name, schema: ContactSchema },
      { name: WhatsAppChat.name, schema: WhatsAppChatSchema },
      { name: WhatsAppMessage.name, schema: WhatsAppMessageSchema },
    ]),
    forwardRef(() => WhatsAppModule),
  ],
  controllers: [ContactWhatsAppController],
  providers: [ContactService, ContactWhatsAppService, ContactResolver],
  exports: [ContactService, ContactWhatsAppService],
})
export class ContactModule {}
