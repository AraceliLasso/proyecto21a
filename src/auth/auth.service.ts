import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import { Usuario } from 'src/usuarios/usuario.entity';
import { UsuariosService } from 'src/usuarios/usuario.service';

@Injectable()
export class AuthService {
    constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
) {}

private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async verifyGoogleToken(token: string): Promise<any> {
    try {
        const ticket = await this.client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return payload;// Devuelve el perfil del usuario decodificado
    } catch (error) {
        throw new Error('Token inválido');
    }
}

    async validateOAuthLogin(decodedToken: any) {
    
        const email = decodedToken.email;
        if (!email) {
            throw new UnauthorizedException('Email no encontrado en el token decodificado.');
        }

        // Realiza la lógica de búsqueda o creación de usuario en tu sistema
        let usuario = await this.usuariosService.encontrarPorEmail(email);
        let esNuevoUsuario = false;

        if (!usuario) {
            console.log("usuario not found, creating new usuario");
            usuario = await this.usuariosService.crearUsuarioOAuth(decodedToken); // Utiliza el token decodificado para la creación de usuario
            esNuevoUsuario = true; // Marca el usuario como nuevo
        }
        
        return {
            usuario:{
                nombre: usuario.nombre,
                email: usuario.email,
                telefono: usuario.telefono,
                edad: usuario.edad,
            },
            esNuevoUsuario, // Devuelve si el usuario es nuevo
        }; 
    }

    
    async generateJwtToken(usuario: Partial<Usuario>): Promise<string> {
        const payload = { 
            sub: usuario.id, 
            nombre: usuario.nombre,
            email: usuario.email,
            telefono: usuario.telefono,
            edad: usuario.edad,
            
        };
        return this.jwtService.sign(payload);

    }
    
}
