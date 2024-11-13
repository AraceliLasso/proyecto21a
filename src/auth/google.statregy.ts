// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, VerifyCallback } from 'passport-google-oauth20';
// import { AuthService } from './auth.service';

// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
//     constructor(private readonly authService: AuthService) {
//     super({
//         clientID: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         callbackURL: 'http://localhost:3000/api/auth/callback/google', // URL de redirección
//         scope: ['openid','email', 'profile'],
//     });
// }

// async validate(accessToken: string, refreshToken: string, profile: any) {
//     console.log('Google profile:', profile); // Imprime el perfil de Google para debug

//     const email = profile.emails?.[0]?.value;
//     const name = profile.name?.givenName;
//     const picture = profile.photos?.[0]?.value;

//     // Asegúrate de manejar el caso donde alguna propiedad no esté disponible
//     if (!email || !name || !picture) {
//         throw new Error('Perfil de google con datos incompletos');
//     }

//     // Retorna la información validada
//     return {
//         email,
//         name,
//         picture,
//     };

//     // const { emails, name, photos } = profile;

//     // // Retorna la información que necesitas
//     // return {
//     //     email: emails[0].value, // Extrae el email
//     //     name: name.givenName, // Nombre del usuario
//     //     picture: photos[0].value, // URL de la foto
//     // };
// }

// }
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';

@Injectable()
export class OAuth2Strategy extends PassportStrategy(Strategy, 'oauth2') {
    constructor() {
    super({
        authorizationURL: 'https://provider.com/oauth2/authorize',
        tokenURL: 'https://provider.com/oauth2/token',
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/api/auth/callback',
        scope: ['profile', 'email'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    // Lógica para validar y gestionar el perfil del usuario
    return {
        accessToken,
        profile,
    };
    }
}

