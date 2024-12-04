import { CrearUsuarioDto } from "./dtos/crear-usuario.dto";
// import { updateusuarioDto } from "./dto/update-usuario.dto";

import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
// import { usuarioWithAdminDto } from "./dto/admin-usuario.dto";
import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";

import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { rolEnum, Usuario } from './usuario.entity';
import { LoginUsuarioDto } from "./dtos/login-usuario.dto";
import { UsuarioAdminDto } from "./dtos/admin-usuario.dto";
import { ActualizarUsuarioDto } from "./dtos/actualizar-usuario.dto";
import { ActualizarPerfilDto } from "src/auth/dtos/actualizar-usuarioGoogle.dto";
import { ActualizarImagenUsuarioDto } from "./dtos/actualizar-imagenusuario.dto";
import { CloudinaryService } from "src/file-upload/cloudinary.service";
import { ModificarRolDto } from "./dtos/modificar-rolUsuario.dto";
// import { actualizarPerfil } from "../auth/dto/update-usuariogoogle.dt";
//import { MailService } from "src/notifications/mail.service";

@Injectable()
export class UsuariosService {
    constructor(
        @InjectRepository(Usuario)
        private readonly usuariosRepository: Repository<Usuario>,
        private readonly jwtService: JwtService,
        private readonly cloudinaryService: CloudinaryService,
        //private readonly mailService: MailService
    ) { }

      // Actualizar usuario
    async update(usuario: Usuario): Promise<Usuario> {
        return this.usuariosRepository.save(usuario);
    }

    async login(loginUsuario: LoginUsuarioDto): Promise<{ usuario: Partial<Usuario>, token: string }> {
        const usuario = await this.usuariosRepository.findOne({ 
            where: {email: loginUsuario.email.toLowerCase()},
            relations: ['membresia', 'inscripciones'],
        });
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


    private async createToken(usuario: Usuario) {
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
            take: limit,
            relations: ['perfilProfesor']
        });

        return usuarios.map(usuario => {
            const usuarioDto = new UsuarioAdminDto();
            usuarioDto.id = usuario.id;
            usuarioDto.nombre = usuario.nombre;
            usuarioDto.edad = usuario.edad;
            usuarioDto.email = usuario.email;
            usuarioDto.telefono = usuario.telefono;
            usuarioDto.estado = usuario.estado;


            // Aquí verificamos si el usuario es admin según su rol
           // usuarioDto.admin = usuario.rol === rolEnum.ADMIN;

            // Determina el rol del usuario
        if (usuario.rol === rolEnum.ADMIN) {
            usuarioDto.rol = 'admin';
        } else if (usuario.perfilProfesor) { // Si tiene un perfil de profesor asociado
            usuarioDto.rol = 'profesor';
        } else {
            usuarioDto.rol = 'cliente';
        }

            return usuarioDto;
        });
    }


    async obtenerUsuarioPorId(id: string): Promise<Usuario | undefined>{
        return this.usuariosRepository.findOne({ where: {id}})
    }

    async crearUsuario(crearUsuario: CrearUsuarioDto, imagen?: Express.Multer.File): Promise<Usuario>{
        try{
        // Verificar que las contraseñas coinciden antes de cualquier procesamiento
        if(crearUsuario.contrasena !== crearUsuario.confirmarContrasena){
            throw new HttpException('Las contraseñas no coinciden', 400)
        }

        // Verificar si el correo ya existe
        const usuarioExistente = await this.usuariosRepository.findOne({ where: { email: crearUsuario.email } });
        if (usuarioExistente) {
            throw new HttpException('El email ya está registrado', 400);
        }

            // Crear una nueva instancia de usuario
            const nuevoUsuario = new Usuario();
            Object.assign(nuevoUsuario, crearUsuario);// Asignar los datos del DTO al nuevo usuario
            console.log('Usuario antes de guardar:', nuevoUsuario);

            // Subir la imagen si existe
            if (imagen) {
                const imageUrl = await this.cloudinaryService.uploadFile(imagen.buffer,'usuario', imagen.originalname);
                nuevoUsuario.imagen = imageUrl;
            }


            const hashedcontrasena = await bcrypt.hash(crearUsuario.contrasena, 10);
            nuevoUsuario.contrasena = hashedcontrasena;// Asignar la contraseña encriptada al nuevo usuario
            console.log('Hashed contrasena:', nuevoUsuario.contrasena);

            return this.usuariosRepository.save(nuevoUsuario)
        } catch (error) {
            console.error('Error al crear el usuario:', error);
            if (error instanceof HttpException) {
                throw error; // Re-lanzar excepciones controladas
            }
        }
        throw new HttpException('Error al crear el usuario', 500);
    }

    async crearUsuarioOAuth(perfil: any): Promise<Usuario> {
        try{
        console.log("perfil", perfil)
        // Verificar si el usuario ya existe
        const existingusuario = await this.usuariosRepository.findOne({ where: { email: perfil.email } });
        if (existingusuario) {
        return existingusuario;
        }


        const nuevoUsuario = new Usuario();
        nuevoUsuario.email = perfil.email;
        nuevoUsuario.nombre = `${perfil.given_nombre || ''} ${perfil.family_nombre || ''}`.trim();

        // Como estos campos no se obtienen de OAuth le pasamos el valor predeterminado de null
        nuevoUsuario.telefono = perfil.telefono || null; 
        nuevoUsuario.edad = perfil.edad || null;
        nuevoUsuario.contrasena = "contrasenaOAuth";
        
        // Guardar el nuevo usuario y devolverlo
        return await this.usuariosRepository.save(nuevoUsuario);

    } catch (error) {
        console.error('Error al guardar el usuario:', error);
        throw new HttpException('Error al crear el usuario con OAuth', 500);
    }
    }

    async actualizarPerfil( email: string , actualizarPerfil: ActualizarPerfilDto): Promise<Usuario> {
        // const email = decodedToken.email;
        // console.log("decodedToken", decodedToken)
        console.log("email capturado del decodedToken", email)

        if (!email) {
            throw new UnauthorizedException('Email no encontrado en el token decodificado.');
        }

        const usuario = await this.usuariosRepository.findOne({ where: { email } });
        console.log("Email encontrado en updateperfil", email)
    
        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }
    
        Object.assign(usuario, actualizarPerfil);
        console.log("actualizarPerfil", actualizarPerfil)

        try {
            const updatedusuario = await this.usuariosRepository.save(usuario);
            console.log("Usuario actualizado en la base de datos:", updatedusuario);
            return updatedusuario
        } catch (error) {
            console.error("Error al guardar en la base de datos:", error);
            throw new HttpException('Error al actualizar el perfil del usuario', 500);
        }

        }
    


    async encontrarPorEmail(email: string){
        return this.usuariosRepository.findOne( {where: {email}})
    }


    async actualizarUsuarios(id: string, actualizarUsuarioDto: ActualizarUsuarioDto, imagen?: Express.Multer.File): Promise<Usuario> {
        const usuario = await this.usuariosRepository.findOne({ where: { id } });
        if (!usuario) {
            throw new Error(`Usuario con ${id} no fue encontrado`);
        }

        // Si la contraseña está presente, encriptarla
        if (actualizarUsuarioDto.contrasena) {
            const salt = await bcrypt.genSalt(10);
            actualizarUsuarioDto.contrasena = await bcrypt.hash(actualizarUsuarioDto.contrasena, salt);
        }

        // Subir la imagen a Cloudinary si se proporciona
        if (imagen) {
            try {
                const imageUrl = await this.cloudinaryService.uploadFile(imagen.buffer, imagen.originalname);
                actualizarUsuarioDto.imagen = imageUrl; // Asignar la URL al DTO
            } catch (error) {
                console.error('Error al subir la imagen a Cloudinary:', error);
                throw new InternalServerErrorException('Error al subir la imagen');
            }
        }

        // Mantener la URL de la imagen actual si no se proporciona una nueva
        if (!imagen && actualizarUsuarioDto.imagen === undefined) {
            actualizarUsuarioDto.imagen = usuario.imagen;
            }

            // Crear un objeto con los campos actuales del usuario, y solo sobrescribir los que se pasen en el DTO
    const datosActualizados = {
        nombre: actualizarUsuarioDto.nombre || usuario.nombre,  // Solo actualizar el nombre si se pasa
        edad: actualizarUsuarioDto.edad || usuario.edad,        // Solo actualizar la edad si se pasa
        telefono: actualizarUsuarioDto.telefono || usuario.telefono, // Solo actualizar el teléfono si se pasa
        email: actualizarUsuarioDto.email || usuario.email,      // Solo actualizar el email si se pasa
        contrasena: actualizarUsuarioDto.contrasena || usuario.contrasena, // Solo actualizar la contraseña si se pasa
        imagen: actualizarUsuarioDto.imagen || usuario.imagen,   // Solo actualizar la imagen si se pasa
    };
        
         // Filtrar propiedades del DTO que no sean undefined
        // const datosActualizados = {
        //     ...usuario,
        //     ...actualizarUsuarioDto,
        //     imagen: actualizarUsuarioDto.imagen || usuario.imagen, // Preservar la imagen si no hay cambios
        // };

            // Guardar los cambios en la base de datos
            await this.usuariosRepository.save({ ...usuario, ...datosActualizados });

            return { ...usuario, ...datosActualizados };

    }

    async modificarRol(id: string, modificarRolDto: ModificarRolDto): Promise<Usuario>{
        const usuario = await this.usuariosRepository.findOne({ where: { id } });

        if (!usuario) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        if (usuario.rol === modificarRolDto.rol) {
            throw new BadRequestException(`El usuario ya tiene el rol "${modificarRolDto.rol}"`);
        }

        usuario.rol = modificarRolDto.rol;

        try {
            const usuarioActualizado =  await this.usuariosRepository.save(usuario);
            return usuarioActualizado;
        } catch (error) {
            console.error("Error al modificar el rol del usuario:", error);
            throw new BadRequestException("No se pudo modificar el rol del usuario");
        }
    }


    async modificarEstadoUsuario(id: string, estado: boolean): Promise<Usuario> {
        const usuario = await this.usuariosRepository.findOne({ where: { id } });
    
        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }
    
        usuario.estado = estado;
        await this.usuariosRepository.save(usuario);

        return this.usuariosRepository.findOne({ where: { id } });
    
    }



    async eliminarUsuarios(id: string): Promise<string> {
        const usuario = await this.usuariosRepository.findOne({ where: { id } });
        if (!usuario) {
            throw new Error(`Usuario con ${id} no fue encontrado`);
        }
        await this.usuariosRepository.remove(usuario);
        return id;
    }
    
}