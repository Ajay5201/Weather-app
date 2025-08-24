import { NestFactory } from '@nestjs/core';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
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
import { ROUTES } from './constants/route.constants';

let app: any;

async function getApp() {
  if (!app) {
    app = await NestFactory.create(AppModule);

    // Apply CORS
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: false,
    });

    app.setGlobalPrefix('api/v1', {
      exclude: ROUTES.HEALTH_CHECK
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
        // Use a more compatible version and ensure proper loading order
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
            // Ensure SwaggerUIBundle is available before initialization
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
    const app = await NestFactory.create(AppModule, {
      cors: {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
      },
    });

    

    

    // Apply global pipes, filters, and interceptors
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());

    app.setGlobalPrefix('api/v1', {
      exclude: [
        { path: 'health-check', method: RequestMethod.GET },
        { path: '/', method: RequestMethod.GET },
      ],
    });
  

    // Set up Swagger documentation with proper CDN assets
    const options = {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'NestJS API Documentation',
      // Updated to use more stable CDN URLs and versions
      customCss: `
        @import url('https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.2/swagger-ui.css');
        .swagger-ui .topbar { display: none; }
      `,
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.2/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.2/swagger-ui-standalone-preset.min.js',
      ],
      customJsStr: `
        // Additional JavaScript to ensure proper loading
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

    const port = 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger is running on: http://localhost:${port}/api/docs`);
  }

  bootstrap();
}