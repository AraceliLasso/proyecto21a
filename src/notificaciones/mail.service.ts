import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';

@Injectable()
export class MailService {
    private oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLEAUTH_CLIENT_ID,     // Client ID de Google
        process.env.GOOGLEAUTH_CLIENT_SECRET, // Client Secret de Google
        'https://developers.google.com/oauthplayground'
    );

    private transporter;

    constructor() {
        // Configura el Refresh Token de OAuth2
        this.oauth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN,
        });
        
        // Crea el transporte de Nodemailer una vez
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // Puedes usar otros servicios como Outlook, Yahoo, etc.
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_USER,
                clientId: process.env.GOOGLEAUTH_CLIENT_ID,
                clientSecret: process.env.GOOGLEAUTH_CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
            },
        });
    }

    async sendMail(to: string, subject: string, text: string, html: string) {
        try {
            const accessToken = await this.oauth2Client.getAccessToken();
            if (!this.transporter.auth) {
                this.transporter.auth = {}; // Inicializa `auth` si no está definido
            }
            this.transporter.auth.accessToken = accessToken.token || ''; // Asigna el accessToken al transportador
            
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to,
                subject,
                text,
                html,
                auth: {
                    type: 'OAuth2',
                    user: process.env.EMAIL_USER,
                    accessToken: accessToken.token, // Usa el token directamente aquí
                },
            };
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email enviado:', result);
            return result;
        } catch (error) {
            console.error('Error al enviar el correo:', error);
            throw error; // Propaga el error para manejarlo adecuadamente
        }
    }
}

