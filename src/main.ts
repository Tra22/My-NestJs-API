import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './global/exception/all.exception.filter';
import { useContainer } from 'class-validator';
import { validationExceptionFactory } from './global/exception/validation.exception';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RoleService } from './user/services/role/role.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const rolesService = app.get(RoleService);
  await rolesService.createSuperAdminRoleIfNotExist();

  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });
  app.useStaticAssets(join(__dirname, '..', 'public/styles'), {
    prefix: '/styles',
  });
  app.setViewEngine('hbs');
  app.setBaseViewsDir(join(__dirname, 'views'));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const config = new DocumentBuilder()
    .setTitle('My Nest Js API')
    .setDescription('The Nest JS API description')
    .setVersion('1.0')
    .addTag('Nest JS API')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Check if we're in production or Vercel environment
  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL !== undefined;

  if (!isProduction && !isVercel) {
    const publicPath = join(__dirname, '..', 'public');
    if (!existsSync(publicPath)) {
      mkdirSync(publicPath);
    }

    const swaggerJsonPath = join(publicPath, 'swagger.json');
    writeFileSync(swaggerJsonPath, JSON.stringify(document, null, 2));
  }

  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Your API Documentation',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
    swaggerUrl: isProduction
      ? 'https://my-nest-js-api.vercel.app/swagger.json'
      : 'https://localhost:3000/swagger.json',
    jsonDocumentUrl: '/swagger.json',
    urls: [{ url: '/swagger.json', name: 'v1' }],
    patchDocumentOnRequest: (req, res, document) => {
      let swaggerJson: OpenAPIObject;

      try {
        const jsonFilePath = join(__dirname, '..', 'public', 'swagger.json');

        if (!existsSync(jsonFilePath)) {
          console.error(
            'swagger.json does not exist at the specified path:',
            jsonFilePath,
          );
          return document;
        }
        const fileContents = readFileSync(jsonFilePath, 'utf-8');
        swaggerJson = JSON.parse(fileContents);
      } catch (err) {
        console.error('Error reading swagger.json file:', err);
        return document;
      }

      // Example modification for production
      // if (isProduction) {
      //   swaggerJson.components = swaggerJson.components || {};
      //   swaggerJson.components.schemas = swaggerJson.components.schemas || {};

      //   swaggerJson.components.schemas.AdditionalSchema = {
      //     type: 'object',
      //     properties: {
      //       id: {
      //         type: 'string',
      //         description: 'Unique identifier for the new resource',
      //       },
      //       name: {
      //         type: 'string',
      //         description: 'Name of the new resource',
      //       },
      //     },
      //     required: ['id', 'name'],
      //   };
      // }
      return swaggerJson;
    },
  });

  app.enableCors({
    origin: '*',
  });

  await app.listen(3000);
}

bootstrap();
