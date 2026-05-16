import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false, // we configure parsers explicitly below
  });
  const logger = new Logger('Bootstrap');

  // JSON body limit — protects against memory DoS via huge payloads.
  const express = await import('express');
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Security response headers (manual — no extra dep needed).
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    }
    next();
  });

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
