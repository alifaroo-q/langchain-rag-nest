import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  timezone: process.env.TZ,
  environment: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 3000,
  userSecret: process.env.USER_SECRET_KEY,
  userExpiresIn: process.env.USER_EXPIRES_IN,
  openAIApiKey: process.env.OPENAI_API_KEY,
}));
