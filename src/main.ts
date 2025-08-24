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

  // Debug middleware - remove in production if not needed
  app.use((req, res, next) => {
    console.log('Incoming request:', {
      method: req.method,
      origin: req.headers.origin,
      url: req.url,
    });
    next();
  });

  // // Global prefix
  // app.setGlobalPrefix('api/v1');

  // CORS configuration - UPDATED
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  
  const allowedOrigins = isProduction 
    ? [
        'https://animated-daffodil-13ba13.netlify.app',
        'https://your-production-frontend.com',
      ]
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:4200',
        'http://localhost:5173',
        'http://localhost:8080',
        'https://animated-daffodil-13ba13.netlify.app',
      ];

  app.enableCors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`Blocked by CORS: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept',
      'Origin',
      'X-Requested-With',
      'Access-Control-Allow-Headers',
      'X-API-Key',
      'sec-ch-ua',
      'sec-ch-ua-mobile',
      'sec-ch-ua-platform',
      'Referer',
      'User-Agent',
      'Access-Control-Request-Headers',
      'Access-Control-Request-Method'
    ],
    exposedHeaders: [
      'Content-Length',
      'Authorization',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Origin'
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false,
    maxAge: 86400,
  });

  // Explicit OPTIONS handler for preflight requests
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '86400');
      return res.status(200).end();
    }
    next();
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
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

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Weather App API')
    .setDescription('A comprehensive weather application API with real-time data, city lookup, and user preferences')
    .setVersion(configService.get<string>('APP_VERSION', '1.0'))
    .addTag('Health', 'Health check endpoints for monitoring system status')
    .addTag('Weather', 'Weather-related endpoints for forecasting and current conditions')
    .addTag('City Lookup', 'City search and geocoding endpoints')
    .addTag('User Preferences', 'User preference management endpoints')
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://weather-app-ajay5201s-projects.vercel.app', 'Production server')
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
  console.log(`🌐 CORS enabled for origins: ${allowedOrigins.join(', ')}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});