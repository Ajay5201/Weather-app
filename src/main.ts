import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { ResponseInterceptor } from './core/interceptors/response.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      // Better validation error messages
      exceptionFactory: (errors) => {
        const messages = errors.map(error => {
          const constraints = Object.values(error.constraints || {});
          return `${error.property}: ${constraints.join(', ')}`;
        });
        return new Error(messages.join('; '));
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  // CORS configuration
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Weather App API')
    .setDescription('A comprehensive weather application API with real-time data, city lookup, and user preferences')
    .setVersion(configService.get<string>('APP_VERSION', '1.0'))
    .addTag('Health', 'Health check endpoints for monitoring system status')
    .addTag('Weather', 'Weather-related endpoints for forecasting and current conditions')
    .addTag('City Lookup', 'City search and geocoding endpoints')
    .addTag('User Preferences', 'User preference management endpoints')
    .addBearerAuth()
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://api.weatherapp.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showRequestHeaders: true,
    },
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);
  console.log(`🏥 Health Check available at: http://localhost:${port}/api/v1/health-check`);
  console.log(`🌍 Environment: ${configService.get<string>('NODE_ENV', 'development')}`);
  console.log(`📦 Version: ${configService.get<string>('APP_VERSION', '1.0.0')}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
