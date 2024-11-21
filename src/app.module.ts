import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { postgresDataSourceConfig } from './config/data-source';
import { UsuarioModule } from './usuarios/usuario.module';
import { CategoriasModule } from './categorias/categories.module';
import { MailModule } from './notificaciones/mail.module';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { ClasesModule } from './clases/clase.module';
import { PerfilesProfesoresModule } from './perfilesProfesores/perfilProfesor.module';
import { MembresiaModule } from './membresias/membresia.module';
import { SeedModule } from './seeds/seeds-module';
import { InscripcionModule } from './inscripciones/inscripcion.module';
import Stripe from 'stripe';
import { StripeModule } from './stripe/stripe.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ postgresDataSourceConfig]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('postgres')
    }),
    UsuarioModule,
    CategoriasModule,
    SharedModule,
    MailModule,
    AuthModule,
    PerfilesProfesoresModule,
    ClasesModule,
    MembresiaModule,
    SeedModule,
    InscripcionModule,
    StripeModule
  ],
controllers: [AppController],
providers: [AppService, CloudinaryService],
exports: []
})

export class AppModule {}