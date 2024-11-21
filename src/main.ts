import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // strips any properties not defined in the DTO
    forbidNonWhitelisted: true, // throws an error if extra properties are present
    transform: true
  }));

  const port = process.env.NODE_PORT || 3000;
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Main');
  logger.log(`This application is running on: ${await app.getUrl()}`);
}
bootstrap();
