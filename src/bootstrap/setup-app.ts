import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { APP_CONFIG } from 'src/config/app/app.config';
import { ConfigService } from '@nestjs/config';

export function setupApp(
  app: NestExpressApplication,
  logger: Logger,
  config: ConfigService,
) {
  app.use(cookieParser());

  //CORS
  const appCfg = config.getOrThrow<{ corsOrigins: string[] }>(APP_CONFIG);
  const allowList = appCfg.corsOrigins;
  app.enableCors({
    origin: (requestOrigin: string, callback) => {
      if (!requestOrigin) {
        callback(null, true); // allow request with no origin (Postman, curl, etc.)
        return;
      }

      if (allowList.includes(requestOrigin)) {
        callback(null, true); // allow request from allowed origin
      }

      // log-warning
      logger.warn(
        `CORS: Blocked request from origin ${requestOrigin} (not in allowed list).`,
      );

      callback(null, false);
    },
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
    credentials: true,
  });

  // validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // API versioning
  app.setGlobalPrefix('api/v1');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableShutdownHooks(); // help application to shutdown gracefully when receiving termination signals (e.g., SIGINT, SIGTERM)
}
