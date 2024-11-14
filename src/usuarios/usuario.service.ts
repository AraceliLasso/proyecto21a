import { CrearUsuarioDto } from "./dtos/crear-usuario.dto";
// import { updateusuarioDto } from "./dto/update-usuario.dto";

import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
// import { usuarioWithAdminDto } from "./dto/admin-usuario.dto";
import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";

import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { rolEnum, Usuario } from './usuario.entity';
import { LoginUsuarioDto } from "./dtos/login-usuario.dto";
import { UsuarioAdminDto } from "./dtos/admin-usuario.dto";
import { ActualizarUsuarioDto } from "./dtos/actualizar-usuario.dto";
import { ActualizarPerfilDto } from "src/auth/dtos/actualizar-usuarioGoogle.dto";
// import { actualizarPerfil } from "../auth/dto/update-usuariogoogle.dt";
//import { MailService } from "src/notifications/mail.service";

@Injectable()
export class UsuariosService{
    constructor (
        @InjectRepository(Usuario)
        private readonly usuariosRepository: Repository<Usuario>,
        private readonly jwtService: JwtService, 
        //private readonly mailService: MailService
    ){}

    async login(loginUsuario: LoginUsuarioDto): Promise<{ usuario: Partial<Usuario>, token: string }> {
        const usuario = await this.usuariosRepository.findOneBy({ email: loginUsuario.email.toLowerCase() });
        console.log('Email recibido en el login:', loginUsuario.email);
        console.log('Usuario encontrado:', usuario);
    
        const coincideContrasena = usuario && await bcrypt.compare(loginUsuario.contrasena, usuario.contrasena);
    
        console.log('Contraseña recibida en el login:', loginUsuario.contrasena);
        console.log('Contraseña coincide:', coincideContrasena);
    
        if (!coincideContrasena) {
            throw new HttpException('Email o contraseña incorrecto', HttpStatus.UNAUTHORIZED);
        }
    
        // Verifica si el rol es ADMIN antes de crear el token
        // if (usuario.rol !== rolEnum.ADMIN) {
        //     throw new HttpException('No tiene permiso para acceder a este recurso', HttpStatus.FORBIDDEN);
        // }
    
        const token = await this.createToken(usuario);
        // Elimina campos sensibles como contrasena
        const { contrasena, ...usuarioSinContrasena } = usuario;
    
        // Devuelve tanto el token como la información del usuario
        return {
            usuario: usuarioSinContrasena,
            token
        };
    }
    
        
        private async createToken(usuario: Usuario){
            const payload = {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol
            };
            return this.jwtService.signAsync(payload)
        }
    

        async obtenerUsuariosPag(page: number, limit: number): Promise<UsuarioAdminDto[]> {
        const offset = (page - 1) * limit;

    const usuarios = await this.usuariosRepository.find({
        skip: offset,
        take: limit
    });

    return usuarios.map(usuario => {
        const usuarioDto = new UsuarioAdminDto();
        usuarioDto.id = usuario.id;
        usuarioDto.nombre = usuario.nombre;
        usuarioDto.edad = usuario.edad;
        usuarioDto.email = usuario.email;
        usuarioDto.telefono = usuario.telefono;

        // Aquí verificamos si el usuario es admin según su rol
        usuarioDto.admin = usuario.rol === rolEnum.ADMIN;

        return usuarioDto;
    });
}
        

    async obtenerUsuarioPorId(id: string): Promise<Usuario | undefined>{
        return this.usuariosRepository.findOne({ where: {id}})
    }

    async crearUsuario(crearUsuario: CrearUsuarioDto): Promise<Usuario>{
        try{
        // Verificar que las contraseñas coinciden antes de cualquier procesamiento
        if(crearUsuario.contrasena !== crearUsuario.confirmarContrasena){
            throw new HttpException('Las contraseñas no coinciden', 400)
        }

        // Verificar si el usuario ya existe en la base de datos
        const usuarioExistente = await this.usuariosRepository.findOne({ where: { email: crearUsuario.email } });
        if (usuarioExistente) {
            throw new HttpException('El usuario con este email ya existe', 400);
        }

        // Crear una nueva instancia de usuario
        const nuevoUsuario = new Usuario();
        Object.assign(nuevoUsuario, crearUsuario);// Asignar los datos del DTO al nuevo usuario
        console.log('Usuario antes de guardar:', nuevoUsuario);        

        const hashedcontrasena = await bcrypt.hash(crearUsuario.contrasena, 10);
        nuevoUsuario.contrasena = hashedcontrasena;// Asignar la contraseña encriptada al nuevo usuario
        console.log('Hashed contrasena:', nuevoUsuario.contrasena);

        return this.usuariosRepository.save(nuevoUsuario)
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        throw new HttpException('Error al crear el usuario', 500);
    }
    }

    
    async encontrarPorEmail(email: string): Promise<Usuario | null>{
        return this.usuariosRepository.findOne( {where: {email}})
    }


    async actualizarUsuarios(id: string, actualizarUsuario: ActualizarUsuarioDto): Promise <Usuario>{
        const usuario = await this.usuariosRepository.findOne( { where: {id}});
        if(!usuario){
            throw new Error(`Usuario con ${id} no fue encontrado`);
        }

        if (actualizarUsuario.contrasena) {

        const salt = await bcrypt.genSalt(10);
        actualizarUsuario.contrasena = await bcrypt.hash(actualizarUsuario.contrasena, salt);
    }

        Object.assign(usuario, actualizarUsuario);
        await this.usuariosRepository.save(usuario)
        return usuario;
    }

    async eliminarUsuarios(id: string): Promise <string>{
        const usuario = await this.usuariosRepository.findOne({ where: {id}});
        if(!usuario){
            throw new Error(`Usuario con ${id} no fue encontrado`);
        }
        await this.usuariosRepository.remove(usuario);
        return id;
    }
}