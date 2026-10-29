import { registerAs } from '@nestjs/config';
import { parseEnvOrigins } from 'src/utils/parse-env-origin';

export const APP_CONFIG = 'app';

export default registerAs(APP_CONFIG, () => ({
  // inside registerAs, we can not use config service, so we use process.env to get the env variables
  port: parseInt(process.env.PORT ?? '8080', 10),
  corsOrigins: parseEnvOrigins(
    process.env.CLIENT_URL,
    process.env.CORS_OTHER_URL,
  ),
}));
