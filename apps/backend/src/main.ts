import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonLoggerService } from './logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import cookieParser from 'cookie-parser';
import { json } from 'express';

process.setMaxListeners(20);

async function bootstrap() {
  try {
    console.log('Creating Nest application...');
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });
    console.log('Nest application created. Setting up logger...');
    app.useLogger(app.get(WinstonLoggerService));
    const configService = app.get(ConfigService);

    console.log('Setting up CORS...');
    app.enableCors({
      origin: configService.get<string>('CORS_ORIGINS')?.split(',') || [
        'http://localhost:3000',
        'http://localhost:3001',
      ],
      credentials: true,
    });

    app.useGlobalFilters(new GlobalExceptionFilter());
    app.use(json({ limit: '20mb' }));
    app.use(cookieParser());

    const port = configService.get('PORT') ?? 3000;
    console.log(`Starting server listen on port ${port}...`);
    await app.listen(port);
    console.log(`Server started successfully on port ${port}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}
bootstrap();
