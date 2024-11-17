import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/usuario.entity';
import { UsuariosService } from 'src/usuarios/usuario.service';
import { Repository } from 'typeorm';
import { LoginGoogleDto } from './dtos/login-usuarioGoogle.dto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
    constructor(
    private readonly usuariosService: UsuariosService,

    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
) {}

// Método para crear un usuario con datos predeterminados
async crearUsuarioGoogle(payload: LoginGoogleDto) {
    const nuevoUsuario = {
        email: payload.email,
        nombre: payload.nombre,
        telefono: payload.telefono || null,
        edad: payload.edad || null,
        contrasena: payload.contrasena || 'contraseñaGoogle', // Contraseña genérica o no usable
        confirmarContrasena: payload.confirmarContrasena || 'contraseñaGoogle',
    };

    try {
        return await this.usuariosRepository.save(nuevoUsuario);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        throw new UnauthorizedException('No se pudo registrar al usuario');
    }
    }

    // Método de autenticación o registro
    async autenticarUsuarioOAuth(payload: LoginGoogleDto) {

    try{
    // Buscar si el usuario ya está registrado
    let usuario = await this.usuariosService.encontrarPorEmail(payload.email);
    let esNuevoUsuario = false;

    // Si no existe, crear el usuario con los datos proporcionados y predeterminados
    if (!usuario) {
        console.log("Usuario no encontrado, crear nuevo usuario");
        usuario = await this.crearUsuarioGoogle(payload);
        esNuevoUsuario = true; // Marca al usuario como nuevo
    }

    return{
        usuario: {
            nombre: usuario.nombre,
            email: usuario.email,
            telefono: usuario.telefono ?? null,
            edad: usuario.edad ?? null,
            rol: usuario.rol || "cliente",
            imagen: usuario.imagen ?? null
        },
        esNuevoUsuario, // Devuelve si el usuario es nuevo
    }  
    } catch (error) {
        console.error('Error en la autenticación OAuth:', error);
        throw new UnauthorizedException('No se pudo autenticar al usuario');
    }
}

async generateJwtToken(usuario: Partial<Usuario>): Promise<string> {
    const payload = { 
        user:{
            sub: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            
        }
    };
    const secretKey = process.env.JWT_SECRET || 'default_secret_key';
    return jwt.sign(payload, secretKey, {
        expiresIn: '1h',
    });

}
}
