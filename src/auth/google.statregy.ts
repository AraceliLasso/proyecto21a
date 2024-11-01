import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly authService: AuthService) {
    super({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3010/auth/google/callback', // URL de redirección
        scope: ['email', 'profile'],
    });
}

async validate(accessToken: string, refreshToken: string, profile: any) {
    console.log('Google profile:', profile); // Imprime el perfil de Google para debug

    const { emails, name, photos } = profile;

    // Retorna la información que necesitas
    return {
        email: emails[0].value, // Extrae el email
        name: name.givenName, // Nombre del usuario
        picture: photos[0].value, // URL de la foto
    };
}

}
