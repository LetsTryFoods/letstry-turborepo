import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

/**
 * WebSocket gateway for real-time WhatsApp support chat.
 * Admin panel connects here to receive live messages without polling.
 *
 * Namespace: /support
 * Rooms: contact:{contactQueryId}
 * Events emitted to client:
 *   - new_contact_message  → { contactQueryId, message }
 *   - window_updated       → { contactQueryId, windowExpiresAt }
 */
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/support',
})
export class WhatsAppSupportGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WhatsAppSupportGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Admin socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Admin socket disconnected: ${client.id}`);
  }

  /** Admin joins a room for a specific contact query conversation */
  @SubscribeMessage('join_contact_room')
  handleJoin(client: Socket, contactQueryId: string) {
    client.join(`contact:${contactQueryId}`);
    this.logger.log(`Socket ${client.id} joined contact:${contactQueryId}`);
    return { event: 'joined', data: contactQueryId };
  }

  /** Admin leaves a room */
  @SubscribeMessage('leave_contact_room')
  handleLeave(client: Socket, contactQueryId: string) {
    client.leave(`contact:${contactQueryId}`);
    return { event: 'left', data: contactQueryId };
  }

  /** Called by the processor to push a new inbound message to all admins watching that contact */
  emitNewMessage(contactQueryId: string, message: any) {
    // Emit to specific room (for open chat window)
    this.server.to(`contact:${contactQueryId}`).emit('new_contact_message', {
      contactQueryId,
      message,
    });
    // Emit globally (for unread badges in table)
    this.server.emit('new_global_message', {
      contactQueryId,
      message,
    });
  }

  /** Called when the 24h window is updated so the UI can refresh the badge */
  emitWindowUpdated(contactQueryId: string, windowExpiresAt: Date) {
    this.server.to(`contact:${contactQueryId}`).emit('window_updated', {
      contactQueryId,
      windowExpiresAt,
    });
  }
}
