import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TurnosModule } from './turnos/turno.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { postgresDataSourceConfig } from './config/data-source';
import { UsuariosModule } from './usuarios/usuario.module';
import { CategoriasModule } from './categorias/categories.module';


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
    UsuariosModule,
    CategoriasModule,
    TurnosModule,
    // SharedModule,
    // StripeModule,
    // FileUploadModule,
    // MailModule,
    // AuthModule
  ],
controllers: [AppController],
providers: [AppService],
exports: []
})

export class AppModule {}