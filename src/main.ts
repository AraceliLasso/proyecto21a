import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as v8 from 'v8';
import { ValidationPipe } from '@nestjs/common';

console.log(`Heap size limit: ${v8.getHeapStatistics().heap_size_limit / (1024 * 1024)} MB`);


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: true, // Evita validar propiedades no enviadas
      skipUndefinedProperties: true, // Ignora campos que no están definidos
    }),
  );
  // Configura CORS
  const frontendUrl = process.env.FRONTEND_URL || 'https://pf-webgym-nx5u-fgpkm5030-matias-projects-446819e4.vercel.app/'; // Definir la URL de frontend
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
