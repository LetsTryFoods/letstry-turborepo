import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';

/**
 * Validates that the request comes from the official LetstryFoods mobile app
 * by checking the x-mobile-key header against the configured secret.
 *
 * This prevents direct web / curl / Postman access to mobile-only endpoints.
 */
@Injectable()
export class MobileAppGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    const mobileKey = req.headers['x-mobile-key'] as string | undefined;
    const expectedKey = this.configService.get<string>('MOBILE_APP_KEY');

    if (!mobileKey || !expectedKey || mobileKey !== expectedKey) {
      throw new ForbiddenException(
        'This endpoint is only accessible from the LetstryFoods mobile app.',
      );
    }

    return true;
  }
}
