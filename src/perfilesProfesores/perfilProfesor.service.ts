import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { PerfilProfesor } from "./perfilProfesor.entity";
import { CrearPerfilProfesorDto } from "./dto/crear-perfilProfesor.dto";
import { ModificarPerfilProfesorDto } from "./dto/modificar-perfilProfesor.dto";
import { ClasesService } from "src/clases/clase.service";
import { Clase } from "src/clases/clase.entity";
import { rolEnum, Usuario } from "src/usuarios/usuario.entity";
import { CloudinaryService } from "src/file-upload/cloudinary.service";

@Injectable()
export class PerfilesProfesoresService{
    constructor (
        @InjectRepository(PerfilProfesor)
        private readonly perfilesProfesoresRepository: Repository<PerfilProfesor>,

        @InjectRepository(Clase)
        private readonly clasesRepository:  Repository<Clase>,

        @InjectRepository(Usuario)
        private readonly usuariosRepository: Repository<Usuario>,
        private readonly cloudinaryService: CloudinaryService
    ){}
    //*(cuando inscripciones este listo)
    //GET alumnos inscriptos a la clase del profesor
    

    async crearPerfilProfesor(usuarioId: string, crearPerfilProfesor: CrearPerfilProfesorDto, imagen: Express.Multer.File,): Promise<PerfilProfesor>{
        // Buscar el usuario
    const usuario = await this.usuariosRepository.findOne({ where: { id: usuarioId } });
    if (!usuario) {
        throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Verificar que el usuario no tenga ya un perfil de profesor
    if (usuario.perfilProfesor) {
        throw new BadRequestException(`El usuario ya tiene un perfil de profesor`);
    }

    // Subir la imagen a Cloudinary
    let imagenUrl: string | null = null;
    if (imagen) {
        try {
           // Como uploadFile devuelve un string, directamente lo asignamos a imagenUrl
            imagenUrl = await this.cloudinaryService.uploadFile(imagen.buffer,'perfilProfesor', imagen.originalname);
        } catch (error) {
            console.error('Error al subir la imagen a Cloudinary:', error);
            throw new InternalServerErrorException('No se pudo subir la imagen');
        }
    }

    // Crear el perfil
    const nuevoPerfil = this.perfilesProfesoresRepository.create({
        ...crearPerfilProfesor,
        imagen: imagenUrl, // Asignar la URL de la imagen al perfil
        usuario, // Asociar el usuario al perfil
    });

    const perfilGuardado = await this.perfilesProfesoresRepository.save(nuevoPerfil);

    // Actualizar el rol del usuario a profesor y su imagen
    usuario.rol = rolEnum.PROFESOR
    if (imagenUrl) {
        usuario.imagen = imagenUrl;
    }
    await this.usuariosRepository.save(usuario);

     // Consultar y devolver el perfil actualizado, incluyendo el usuario con el rol actualizado
        return this.perfilesProfesoresRepository.findOne({
        where: { id: perfilGuardado.id },
        relations: ['usuario'], // Incluye al usuario en la respuesta
    });
}


    async obtenerPerfilProfesorConUsuario(id: string): Promise<PerfilProfesor> {
        return await this.perfilesProfesoresRepository.findOne({
            where: { id },
            relations: ['usuario'], // Incluye los datos del usuario
        });
    }


    //Obtengo todos los perfiles de los profesores 
    async obtenerPerfilProfesor(): Promise <PerfilProfesor[]>{
        return await this.perfilesProfesoresRepository.find({
            relations: ['clases'],
            where: { clases: { estado: true } },
    })
    }

    //Obtengo los perfiles por clases
    async obtenerPerfilProfesorClase(): Promise <PerfilProfesor[]>{
        return await this.perfilesProfesoresRepository.find({ relations: ['clases'] })
    }

    async obtenerPerfilProfesorPorId(id: string) : Promise<PerfilProfesor>{
        const perfilProfesor = await this.perfilesProfesoresRepository.findOne(
            { where: { id: id  },
        })
        if(!perfilProfesor){
            throw new NotFoundException(`Perfil de profesor con ID ${id} no encontrado`);
        }
        return perfilProfesor;      
    }


    //Obtengo el perfil del profesor por id
    async obtenerPerfilProfesorPorUsuarioId(usuarioId: string) : Promise<PerfilProfesor>{
        const perfilProfesor = await this.perfilesProfesoresRepository.findOne(
            { where: { usuario: { id: usuarioId } },
            relations: ['clases', 'usuario'],
        })
        if(!perfilProfesor){
            throw new NotFoundException(`Perfil de profesor con ID ${usuarioId} no encontrado`);
        }
        return perfilProfesor;      
    }

    //Obtengo el perfil del profesor por id
    async obtenerPerfilProfesorIdYClase(id: string) : Promise<PerfilProfesor>{
        const perfilProfesor = await this.perfilesProfesoresRepository.findOne({ where: {id}, relations: ['clases', 'usuario'],})
        if(!perfilProfesor){
            throw new NotFoundException(`Perfil de profesor con ID ${id} no encontrado`);
        }
        return perfilProfesor;      
    }

    
    async obtenerPerfilProfesorConClasesActivas(id: string): Promise<PerfilProfesor> {
        const perfilProfesor = await this.perfilesProfesoresRepository.createQueryBuilder('perfilProfesor')
            .leftJoinAndSelect('perfilProfesor.clases', 'clase', 'clase.estado = true') // Filtra solo las clases activas
            .where('perfilProfesor.id = :id', { id })
            .getOne();
    
        if (!perfilProfesor) {
            throw new NotFoundException(`Perfil de profesor con ID ${id} no encontrado`);
        }
    
        return perfilProfesor;
    }  


    async modificarPerfilProfesor(id: string, modificarPerfilProfesor: Partial<ModificarPerfilProfesorDto>): Promise<PerfilProfesor>{

        console.log('Buscando perfil de profesor con ID:', id);
        const perfilProfesor = await this.perfilesProfesoresRepository.findOne(
            { where: { id },
            relations: ['usuario']
        });

        console.log('PerfilProfesor encontrado:', perfilProfesor);
        if (!perfilProfesor) {
        throw new NotFoundException(`Perfil del profesor con ID ${id} no encontrado`);
        } 
        
        // Verificar si el nombre ya existe en otro perfil, solo si el nombre ha cambiado
        if (
            modificarPerfilProfesor.nombre &&
            modificarPerfilProfesor.nombre !== perfilProfesor.nombre
        ) {
            const existingPerfilProfesor = await this.perfilesProfesoresRepository.findOne({
            where: { nombre: modificarPerfilProfesor.nombre, id: Not(id) },
            });
            if (existingPerfilProfesor) {
                throw new BadRequestException(
                    `El nombre del perfil de profesor "${modificarPerfilProfesor.nombre}" ya existe`
                );
            }
        }

        // Si hay una nueva imagen, actualiza también la imagen del usuario
        if (modificarPerfilProfesor.imagen && perfilProfesor.usuario) {
            perfilProfesor.usuario.imagen = modificarPerfilProfesor.imagen;
            await this.usuariosRepository.save(perfilProfesor.usuario); // Guarda los cambios en el usuario
        }


        Object.assign(perfilProfesor, modificarPerfilProfesor);
        return this.perfilesProfesoresRepository.save(perfilProfesor);
    }

    async cambiarEstadoPerfilProfesor(id: string, estado: boolean): Promise<PerfilProfesor> {
        console.log('Buscando perfil de profesor con ID:', id);
        const perfilProfesor = await this.perfilesProfesoresRepository.findOne({ where: { id } });
    
        console.log('PerfilProfesor encontrado:', perfilProfesor);
        if (!perfilProfesor) {
            throw new NotFoundException(`Perfil del profesor con ID ${id} no encontrado`);
        }
    
        // Cambiar el estado lógico
        perfilProfesor.estado = estado;
        await this.perfilesProfesoresRepository.save(perfilProfesor);
    
        return perfilProfesor;;
    }

    async eliminarPerfilProfesor(id: string): Promise<string> {
        const perfilProfesor = await this.perfilesProfesoresRepository.findOne({where: {id}});
        if (!perfilProfesor) {
            throw new NotFoundException(`Perfil del profesor con ID ${id} no encontrado`);
        }

        const clasesAsociadas = await this.clasesRepository.find({ where: { perfilProfesor: { id } } });
            if (clasesAsociadas.length > 0) {
        throw new BadRequestException(`No se puede eliminar el perfil porque tiene clases asociadas.`);
        }

        const nombrePerfil = perfilProfesor.nombre;
        await this.perfilesProfesoresRepository.remove(perfilProfesor);
        return `Perfil del profesor "${nombrePerfil}" eliminado exitosamente`;
    }
    
}