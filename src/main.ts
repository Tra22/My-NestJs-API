import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './global/exception/all.exception.filter';
import { useContainer } from 'class-validator';
import { validationExceptionFactory } from './global/exception/validation.exception';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply global pipes for validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  // Global exception filter
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // Enable class-validator to use Nest container
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('My Nest Js API')
    .setDescription('The Nest JS API description')
    .setVersion('1.0')
    .addTag('Nest JS API')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Define the path to the public folder for storing swagger.json
  const publicPath = join(__dirname, '..', 'public');

  // Ensure the 'public' folder exists before attempting to write
  if (!existsSync(publicPath)) {
    mkdirSync(publicPath, { recursive: true });
  }

  // File path to save the swagger.json
  const swaggerJsonPath = join(publicPath, 'swagger.json');

  // Only write swagger.json if the file does not exist or to ensure it is always up to date.
  writeFileSync(swaggerJsonPath, JSON.stringify(document, null, 2));

  // Set up Swagger UI for viewing API documentation
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Your API Documentation',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
    ],
    swaggerOptions: {
      url: '/swagger.json', // This points to the swagger.json file in the public folder
    },
  });

  // Start the application on port 3000
  await app.listen(3000);
}

bootstrap();
