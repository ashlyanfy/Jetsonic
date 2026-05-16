import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const isProd = process.env.NODE_ENV === 'production';
  const raw = (process.env.CORS_ORIGINS ?? '').trim();
  const origins = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (origins.length === 0 || origins.includes('*')) {
    if (isProd) {
      throw new Error(
        'CORS_ORIGINS must be set to an explicit comma-separated list of origins in production. Wildcards are not allowed.',
      );
    }
    logger.warn('CORS_ORIGINS is empty or wildcard — allowing all origins (dev only).');
    app.enableCors({ origin: true, credentials: true });
  } else {
    logger.log(`CORS enabled for: ${origins.join(', ')}`);
    app.enableCors({ origin: origins, credentials: true });
  }

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  logger.log(`Jetsonic API listening on http://localhost:${port}/api/v1`);
}

bootstrap();
