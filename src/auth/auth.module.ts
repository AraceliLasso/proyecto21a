import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SharedModule } from 'src/shared/shared.module';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwtStrategy';
import { MailModule } from 'src/notifications/mail.module';
import { UsuarioModulo } from 'src/usuarios/usuario.module';
import { GoogleStrategy } from './google.statregy';

@Module({
    imports: [
        UsuarioModulo, PassportModule, SharedModule, MailModule],
    providers: [
        AuthService,
        JwtStrategy, // Estrategia para autenticación JWT
    GoogleStrategy, // Estrategia de autenticación de Google
    ],
    controllers: [AuthController],
})
export class AuthModule {}
