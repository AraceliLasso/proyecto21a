import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';

@Injectable()
export class OAuth2Strategy extends PassportStrategy(Strategy, 'oauth2') {
    constructor() {
    super({
        authorizationURL: 'https://provider.com/oauth2/authorize',
        tokenURL: 'https://provider.com/oauth2/token',
        clientID: process.env.GOOGLEAUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLEAUTH_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === 'production'
        ? 'https://pf-webgym.vercel.app/auth/google/callback'
        : 'http://localhost:3000/auth/google/callback',
        scope: ['profile', 'email'],
        });
    }

    // async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    // // Lógica para validar y gestionar el perfil del usuario
    // return {
    //     accessToken,
    //     profile,
    // };
    // }
    async validate(payload: any) {
        console.log("Payload from token:", payload);
        return payload.user ? payload.user : null; // Devuelve el `user` del payload si existe
    }
}

