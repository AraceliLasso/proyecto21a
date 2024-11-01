import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';

@Injectable()
export class MailService {

  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,     // Client ID de Google
    process.env.GOOGLE_CLIENT_SECRET, // Client Secret de Google
    'https://developers.google.com/oauthplayground'
  );


    constructor() { // Configura el Refresh Token de OAuth2
    this.oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });
    
    
    }

    async sendMail(to: string, subject: string, text: string, html: string) {
      try{
        const accessToken = await this.oauth2Client.getAccessToken();
    
        const transporter = nodemailer.createTransport({// Crea el transporte de Nodemailer con OAuth2
        service: 'gmail', // Puedes usar otros servicios como Outlook, Yahoo, etc.
          auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_USER,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
          accessToken:accessToken.token || '', // Genera el Access Token automáticamente
  },
});
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
      };
        const result = await transporter.sendMail(mailOptions);
        console.log('Email enviado:', result);
        return result;
      } catch (error) {
        console.error('Error al enviar el correo:', error);
        throw error; // Propaga el error para manejarlo adecuadamente
      }
    }
}
