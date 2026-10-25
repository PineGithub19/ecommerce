import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IncomingMessage } from 'http';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      // forRootAsync means config will be created via Dependency Injection (DI)
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDev = configService.get<string>('NODE_ENV') === 'development';
        return {
          pinoHttp: {
            level: isDev ? 'debug' : 'info',
            transport: isDev
              ? {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                  },
                }
              : undefined,
            // TODO: add reqId
            // Hide fields that will be vulnerable to sensitive data exposure in logs
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.body.password',
                'req.headers["set-cookie"]',
              ],
              censor: '[REDACTED]',
            },
            customProps: (req: IncomingMessage) => ({
              // Add userId to the log context if available
              userId: (req as IncomingMessage & { user?: { id: string } }).user
                ?.id,
            }),
          },
        };
      },
    }),
  ],
  exports: [LoggerModule],
})
export class PinoLoggerModule {}
