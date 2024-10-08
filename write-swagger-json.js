const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module'); // Use dist because of build output
const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');
const fs = require('fs');
const path = require('path');

async function generateSwagger() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  const config = new DocumentBuilder()
    .setTitle('My Nest Js API')
    .setDescription('The Nest JS API description')
    .setVersion('1.0')
    .addTag('Nest JS API')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Ensure the public directory exists
  const publicPath = path.join(__dirname, 'public');
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
  }

  // Write the swagger.json file to the public folder
  const swaggerJsonPath = path.join(publicPath, 'swagger.json');
  fs.writeFileSync(swaggerJsonPath, JSON.stringify(document, null, 2));

  console.log('Swagger JSON generated at:', swaggerJsonPath);

  process.exit(0); // Exit gracefully
}

generateSwagger();
