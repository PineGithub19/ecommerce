import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { parseEnvOrigins } from './utils/parse-env-origin';
import { ValidationPipe } from '@nestjs/common';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from 'node_modules/@nestjs/config/dist/config.service';
import { Logger } from 'nestjs-pino';

const getCorsAllowList = (config: ConfigService) => {
  return parseEnvOrigins(
    config.get<string>('CLIENT_URL'),
    config.get('CORS_OTHER_URL'),
  );
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));

  app.use(cookieParser());

  const config = app.get(ConfigService);
  const logger = app.get(Logger);

  //cors
  const allowList = getCorsAllowList(config);
  app.enableCors({
    origin: (requestOrigin: string, callback) => {
      if (!requestOrigin) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        callback(null, true); // allow request with no origin (Postman, curl, etc.)
        return;
      }

      if (allowList.includes(requestOrigin)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        callback(null, true); // allow request from allowed origin
      }

      // log-warning
      logger.warn(
        `CORS: Blocked request from origin ${requestOrigin} (not in allowed list).`,
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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

  const port = config.get<number>('PORT') ?? 8080;
  await app.listen(config.get<number>('PORT') ?? 8080);
  logger.log(`Server is running on port ${port}`);
}
bootstrap();
