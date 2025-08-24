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
    app = await NestFactory.create(AppModule, {
      // Configure CORS at app creation level for Vercel
      cors: {
        origin: ['https://animated-daffodil-13ba13.netlify.app', 'http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      },
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
        customSiteTitle: 'NestJS API Documentation',
        customCss: `
          @import url('https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.2/swagger-ui.css');
          .swagger-ui .topbar { display: none; }
        `,
        customJs: [
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.2/swagger-ui-bundle.min.js',
          'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.2/swagger-ui-standalone-preset.min.js',
        ],
        customJsStr: `
          window.addEventListener('DOMContentLoaded', function() {
            if (typeof SwaggerUIBundle !== 'undefined') {
              console.log('SwaggerUIBundle loaded successfully');
            } else {
              console.error('SwaggerUIBundle not found');
            }
          });
        `,
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

// Export for Vercel - Fixed to properly handle requests through NestJS
module.exports = async (req: any, res: any) => {
  const nestApp = await getApp();
  
  // Handle preflight OPTIONS requests explicitly
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://animated-daffodil-13ba13.netlify.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin,X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(200).end();
    return;
  }

  // Set CORS headers for actual requests
  res.setHeader('Access-Control-Allow-Origin', 'https://animated-daffodil-13ba13.netlify.app');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Use the NestJS application to handle the request properly
  const httpAdapter = nestApp.getHttpAdapter();
  return httpAdapter.getInstance()(req, res);
};

// Also export as default
module.exports.default = module.exports;

// For local development
if (require.main === module) {
  async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
      cors: {
        origin: ['https://animated-daffodil-13ba13.netlify.app', 'http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      },
    });

    // Apply global pipes, filters, and interceptors
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());

    // Set up Swagger documentation with proper CDN assets
    const options = {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'NestJS API Documentation',
      customCss: `
        @import url('https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.2/swagger-ui.css');
        .swagger-ui .topbar { display: none; }
      `,
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.2/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.2/swagger-ui-standalone-preset.min.js',
      ],
      customJsStr: `
        console.log('Swagger UI custom JS loaded');
        window.addEventListener('load', function() {
          console.log('Page fully loaded, SwaggerUIBundle available:', typeof SwaggerUIBundle !== 'undefined');
        });
      `,
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

    const port = 3002;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger is running on: http://localhost:${port}/api/docs`);
  }

  bootstrap();
}