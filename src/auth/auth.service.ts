import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import { Usuario } from 'src/usuarios/usuario.entity';
import { UsuariosService } from 'src/usuarios/usuario.service';
import { Repository } from 'typeorm';
import { LoginGoogleDto } from './dtos/login-usuarioGoogle.dto';

@Injectable()
export class AuthService {
    
    constructor(
    private readonly usuariosService: UsuariosService,
    
    private readonly jwtService: JwtService,
    @InjectRepository(Usuario)
    private userRepository: Repository<Usuario>,
) {}

private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async verifyGoogleToken(token: string): Promise<any> {
    console.log("Token recibido:", token);
    try {
        const ticket = await this.client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            throw new Error('Token inválido');
        }
        return payload;// Devuelve el perfil del usuario decodificado
    } catch (error) {
        throw new Error('Error al verificar el token de Google: ' + error.message);
    }
}

async validateGoogleUser(loginGoogleDto: LoginGoogleDto): Promise<any> {
    const { token } = loginGoogleDto;

    // Verifica el token con Google
    const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
        throw new UnauthorizedException('Invalid token');
    }

    // Busca al usuario en la base de datos o lo registra si es nuevo
    let user = await this.usuariosService.encontrarPorEmail(payload.email);
    if (!user) {
        user = await this.usuariosService.crearUsuario({
        email: payload.email,
        nombre: payload.name,
        telefono:  null,
        edad:  null,
        contrasena:  "contraseñaGoogle",
        confirmarContrasena: "contraseñaGoogle"
        //id: payload.sub, // ID de Google
        });
    }

    return user;
    }

    // async validateOAuthLogin(decodedToken: any) {
    
    //     console.log("decodedToken en funcion validateOAuthLogin" , decodedToken)
    //     const email = decodedToken.email;
    //     if (!email) {
    //         throw new UnauthorizedException('Email no encontrado en el token decodificado.');
    //     }

    //     // Realiza la lógica de búsqueda o creación de usuario en tu sistema
    //     let usuario = await this.usuariosService.encontrarPorEmail(email);
    //     let esNuevoUsuario = false;

    //     if (!usuario) {
    //         console.log("usuario not found, creating new usuario");
    //         usuario = await this.usuariosService.crearUsuarioOAuth(decodedToken); // Utiliza el token decodificado para la creación de usuario
    //         esNuevoUsuario = true; // Marca el usuario como nuevo
    //     }
        
    //     return {
    //         usuario:{
    //             nombre: usuario.nombre,
    //             email: usuario.email,
    //             telefono: usuario.telefono,
    //             edad: usuario.edad,
    //         },
    //         esNuevoUsuario, // Devuelve si el usuario es nuevo
    //     }; 
    // }

    
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
    
    async saveGoogleUser(userData: { email: string, name: string, phone?: number }) {
        if (!userData.email || !userData.name) {
            throw new Error('Email y nombre son obligatorios.');
        }

        // Verificar si el usuario ya existe en la base de datos
        let user = await this.userRepository.findOne({ where: { email: userData.email } });
    
        if (!user) {
          // Si el usuario no existe, crearlo
            user = this.userRepository.create({
            email: userData.email,
            nombre: userData.name,
            telefono: userData.phone || null,
            });
    
          // Guardar el usuario en la base de datos
            await this.userRepository.save(user);
        }
    
        return user;
        }
}
