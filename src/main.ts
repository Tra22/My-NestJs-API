import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './global/exception/all.exception.filter';
import { useContainer } from 'class-validator';
import { validationExceptionFactory } from './global/exception/validation.exception';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('My Nest Js API')
    .setDescription('The Nest JS API description')
    .setVersion('1.0')
    .addTag('Nest JS API')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // If the environment is not Vercel or production, generate the Swagger file
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.VERCEL === undefined
  ) {
    const publicPath = join(__dirname, '..', 'public');
    if (!existsSync(publicPath)) {
      mkdirSync(publicPath);
    }

    // Write the swagger.json to the public folder (which will be static)
    const swaggerJsonPath = join(publicPath, 'swagger.json');
    writeFileSync(swaggerJsonPath, JSON.stringify(document, null, 2));
  }

  // Serve Swagger UI
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
    jsonDocumentUrl: '/swagger.json',
  });

  await app.listen(3000);
}

bootstrap();
