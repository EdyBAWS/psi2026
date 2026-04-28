import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Activăm CORS pentru a permite cereri de pe frontend-ul de React
  app.enableCors(); 
  
  // Activăm validările globale bazate pe DTO-uri
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Curăță câmpurile care nu sunt în DTO
    transform: true, // Transformă payload-urile în instanțe de clase
  }));

  await app.listen(3000);
}
bootstrap();