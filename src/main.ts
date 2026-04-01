import { NestFactory } from '@nestjs/core';
import { AppModule } from './app-module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Stock API')
    .setDescription('Motor de priorização de estoque')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);

  console.log('Application is running on: http://localhost:3000');
  console.log('Swagger disponível em: http://localhost:3000/docs');
}

bootstrap();