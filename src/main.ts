import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { ResponseInterceptor } from './core/interceptors/response.interceptor';
import { SuccessObjectResponseDto } from './common/dto/success/success-object-response.dto';
import {
  ErrorResponseDto,
  SuccessArrayResponseDto,
  SuccessMessageResponseDto,
  SuccessPaginatedResponseDto,
} from './common/dto';

let app: any;

async function getApp() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api/v1');

    // Apply CORS with specific origins for security
    app.enableCors({
      origin: ['*'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    });

    // Apply global pipes, filters, and interceptors
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());

    // Set up Swagger documentation (only when enabled)
    if (process.env.ENABLE_SWAGGER === 'true') {
      const options = {
        swaggerOptions: {
          persistAuthorization: true,
        },
        customCssUrl: [
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
        ],
        customJs: [
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
        ],
        customSiteTitle: 'NestJS API Documentation',
      };

      const config = new DocumentBuilder()
        .setTitle('NestJS API')
        .setDescription('NestJS API Documentation')
        .setVersion('1.0')
        .addBearerAuth()
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

      SwaggerModule.setup('api/docs', app, document, options);
    }

    await app.init();
  }
  return app;
}

// Export for Vercel
module.exports = async (req: any, res: any) => {
  // Handle CORS for preflight OPTIONS requests before NestJS processes them
  const origin = req.headers.origin;
  const allowedOrigins = [
    '*'
  ];

  // Set CORS headers for all requests
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin,X-Requested-With');

  // Handle OPTIONS requests immediately without going through NestJS auth
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(200).end();
    return;
  }

  const nestApp = await getApp();
  return nestApp.getHttpAdapter().getInstance()(req, res);
};

// Also export as default
module.exports.default = module.exports;

// For local development
if (require.main === module) {
  async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
      cors: {
        origin: [ '*'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      },
    });

    app.setGlobalPrefix('api/v1');
    // Apply global pipes, filters, and interceptors
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());

    // Set up Swagger documentation with CDN assets
    const options = {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customCssUrl: ['https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css'],
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
      ],
      customSiteTitle: 'NestJS API Documentation',
    };

    const config = new DocumentBuilder()
      .setTitle('NestJS API')
      .setDescription('NestJS API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
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
    SwaggerModule.setup('api/docs', app, document, options);

    const port = 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger is running on: http://localhost:${port}/api/docs`);
  }

  bootstrap();
}