import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { initializeFirebaseApp } from "./firebase";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  initializeFirebaseApp()

  const config = new DocumentBuilder()
    .setTitle('Safrasul Admin API')
    .setDescription('API for managing products, banners, and blog posts')
    .addBearerAuth()
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3024);
}
bootstrap();
