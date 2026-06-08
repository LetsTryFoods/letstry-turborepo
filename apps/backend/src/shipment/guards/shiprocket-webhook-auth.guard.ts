import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class ShiprocketWebhookAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const expectedSecret = this.configService.get<string>(
      'shiprocket.webhookSecret',
    );

    if (!expectedSecret) {
      return true;
    }

    const providedSecret =
      request.headers['x-api-key'] || request.query['x-api-key'];

    if (providedSecret !== expectedSecret) {
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }
}
