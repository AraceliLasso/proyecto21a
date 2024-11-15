import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as v8 from 'v8';
import { ValidationPipe } from '@nestjs/common';

console.log(`Heap size limit: ${v8.getHeapStatistics().heap_size_limit / (1024 * 1024)} MB`);


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  

  // Configura CORS
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'; // Definir la URL de frontend
  console.log({ frontendUrl });

  app.enableCors({
    origin: frontendUrl,  // Asegúrate de que esta URL sea la correcta
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,  // Si usas cookies o autenticación basada en sesiones
    allowedHeaders: 'Authorization,Content-Type, Accept',
    maxAge: 3600,
  });

  app.useGlobalPipes(new ValidationPipe());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("ForgeFit")
    .setDescription("Esta aplicación permite a los usuarios registrarse, consultar y acceder a una variedad de actividades ofrecidas por el gimnasio")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api", app, document);

  await app.listen(3010);
}
bootstrap();
