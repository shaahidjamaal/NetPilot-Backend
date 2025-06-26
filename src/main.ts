import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Enable CORS for frontend integration
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
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

    // Use PORT from environment variables
    const port = parseInt(process.env.PORT || '3000') || 3000;
    await app.listen(port);

    console.log(`🚀 NetPilot Backend is running on: http://localhost:${port}/api`);
    console.log(`📚 API Documentation: http://localhost:${port}/api`);
    console.log(`🔗 Health Check: http://localhost:${port}/api`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: Connected to MongoDB`);

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('🛑 SIGINT received, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start the application:', error.message);

    if (error.code === 'EADDRINUSE') {
      console.error('🔧 Port is already in use. To fix this:');
      console.error('   1. Change PORT in your .env file');
      console.error('   2. Or kill the process using the port:');
      console.error('      Windows: netstat -ano | findstr :3000 && taskkill /PID <PID> /F');
      console.error('      Mac/Linux: lsof -ti:3000 | xargs kill -9');
    }

    process.exit(1);
  }
}
bootstrap();
