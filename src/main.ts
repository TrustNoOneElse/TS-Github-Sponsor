import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';

async function bootstrap() {
  config();
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: process.env.ORIGIN,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    },
  });
  console.log('Start Server on port: ' + process.env.PORT);
  await app.listen(process.env.PORT);
}
bootstrap();
