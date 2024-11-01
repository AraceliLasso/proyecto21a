import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwtStrategy';
import { UsuarioModule } from 'src/usuarios/usuario.module';
import { GoogleStrategy } from './google.statregy';
import { MailModule } from 'src/notificaciones/mail.module';
import { SharedModule } from 'src/shared/shared.module';

@Module({
    imports: [
        UsuarioModule, PassportModule, SharedModule, MailModule],
    providers: [
        AuthService,
        JwtStrategy, // Estrategia para autenticación JWT
    GoogleStrategy, // Estrategia de autenticación de Google
    ],
    controllers: [AuthController],
})
export class AuthModule {}
