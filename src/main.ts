import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { ResponseInterceptor } from './core/interceptors/response.interceptor';
import {
  ErrorResponseDto,
  SuccessArrayResponseDto,
  SuccessMessageResponseDto,
  SuccessPaginatedResponseDto,
  SuccessObjectResponseDto,
} from './common/dto';
import { ConfigService } from '@nestjs/config';

let app: any;

async function getApp() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Global prefix
    app.setGlobalPrefix('api/v1');

    // Apply CORS
    app.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    // Apply global pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        exceptionFactory: (errors) => {
          const messages = errors.map((error) => {
            const constraints = Object.values(error.constraints || {});
            return `${error.property}: ${constraints.join(', ')}`;
          });
          return new Error(messages.join('; '));
        },
      }),
    );

    // Apply global filters & interceptors
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());

    // Swagger setup
    if (process.env.ENABLE_SWAGGER !== 'false') {
      const config = new DocumentBuilder()
        .setTitle('Weather App API')
        .setDescription(
          'A comprehensive weather application API with real-time data, city lookup, and user preferences',
        )
        .setVersion('1.0')
        .addTag('Health', 'Health check endpoints for monitoring system status')
        .addTag('Weather', 'Weather-related endpoints for forecasting and current conditions')
        .addTag('City Lookup', 'City search and geocoding endpoints')
        .addTag('User Preferences', 'User preference management endpoints')
        .addBearerAuth()
        .addServer('http://localhost:3000', 'Development server')
        .addServer('https://api.weatherapp.com', 'Production server')
        .build();

      const document = SwaggerModule.createDocument(app, config, {
        extraModels: [
          SuccessObjectResponseDto,
          SuccessArrayResponseDto,
          SuccessPaginatedResponseDto,
          SuccessMessageResponseDto,
          ErrorResponseDto,
        ],
      });

      SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
          filter: true,
          showRequestHeaders: true,
        },
      });
    }

    await app.init();
  }
  return app;
}

// Export for Vercel
module.exports = async (req: any, res: any) => {
  const nestApp = await getApp();
  return nestApp.getHttpAdapter().getInstance()(req, res);
};

// Also export as default
module.exports.default = module.exports;

// For local development
if (require.main === module) {
  async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    app.setGlobalPrefix('api/v1');

    app.enableCors({
      origin: configService.get<string>('CORS_ORIGIN', '*'),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: (errors) => {
          const messages = errors.map((error) => {
            const constraints = Object.values(error.constraints || {});
            return `${error.property}: ${constraints.join(', ')}`;
          });
          return new Error(messages.join('; '));
        },
      }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());

    // Swagger setup (same as above)
    const config = new DocumentBuilder()
      .setTitle('Weather App API')
      .setDescription('A comprehensive weather application API')
      .setVersion(configService.get<string>('APP_VERSION', '1.0'))
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = configService.get<number>('PORT', 3000);
    await app.listen(port);

    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger available at: http://localhost:${port}/api/docs`);
  }

  bootstrap();
}
