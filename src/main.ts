import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { parseEnvOrigins } from './utils/parse-env-origin';
import { ValidationPipe } from '@nestjs/common';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from 'node_modules/@nestjs/config/dist/config.service';

const getCorsAllowList = (config: ConfigService) => {
  return parseEnvOrigins(
    config.get<string>('CLIENT_URL'),
    config.get('CORS_OTHER_URL'),
  );
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const config = app.get(ConfigService);

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

  await app.listen(config.get<number>('PORT') ?? 8080);
}
bootstrap();
