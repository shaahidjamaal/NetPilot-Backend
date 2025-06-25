import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration
  app.enableCors({
    origin: 'http://localhost:3000' ,
    credentials: true,
  });

  // Global validation pipe for request validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTO instances
      disableErrorMessages: process.env.NODE_ENV === 'production', // Hide error details in production
    }),
  );

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  const port = 3001;
  await app.listen(port);

  console.log(`🚀 NetPilot Backend is running on: http://localhost:${port}/api`);
  console.log(`📚 API Documentation: http://localhost:${port}/api`);
}
bootstrap();
