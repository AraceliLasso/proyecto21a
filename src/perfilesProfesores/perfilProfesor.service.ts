import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { PerfilProfesor } from "./perfilProfesor.entity";
import { CrearPerfilProfesorDto } from "./dto/crear-perfilProfesor.dto";
import { ModificarPerfilProfesorDto } from "./dto/modificar-perfilProfesor.dto";
import { ClasesService } from "src/clases/clase.service";
import { Clase } from "src/clases/clase.entity";
import { Usuario } from "src/usuarios/usuario.entity";

@Injectable()
export class PerfilesProfesoresService{
    constructor (
        @InjectRepository(PerfilProfesor)
        private readonly perfilesProfesoresRepository: Repository<PerfilProfesor>,

        @InjectRepository(Clase)
        private readonly clasesRepository:  Repository<Clase>,

        @InjectRepository(Usuario)
        private readonly usuariosRepository: Repository<Usuario>
    ){}
    //*(cuando inscripciones este listo)
    //GET alumnos inscriptos a la clase del profesor
    

    async crearPerfilProfesor(usuarioId: string, crearPerfilProfesor: CrearPerfilProfesorDto): Promise<PerfilProfesor>{
        // Buscar el usuario
    const usuario = await this.usuariosRepository.findOne({ where: { id: usuarioId } });
    if (!usuario) {
        throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Verificar que el usuario no tenga ya un perfil de profesor
    if (usuario.perfilProfesor) {
        throw new BadRequestException(`El usuario ya tiene un perfil de profesor`);
    }

    // Crear el perfil
    const nuevoPerfil = this.perfilesProfesoresRepository.create({
        ...crearPerfilProfesor,
        usuario, // Asociar el usuario al perfil
    });

    return this.perfilesProfesoresRepository.save(nuevoPerfil);
}


    async obtenerPerfilProfesorConUsuario(id: string): Promise<PerfilProfesor> {
        return await this.perfilesProfesoresRepository.findOne({
            where: { id },
            relations: ['usuario'], // Incluye los datos del usuario
        });
    }


    //Obtengo todos los perfiles de los profesores relacionado con usuario
    async obtenerPerfilProfesor(): Promise <PerfilProfesor[]>{
        return await this.perfilesProfesoresRepository.find({ relations: ['usuario'] })
    }

    //Obtengo los perfiles por clases
    async obtenerPerfilProfesorClase(): Promise <PerfilProfesor[]>{
        return await this.perfilesProfesoresRepository.find({ relations: ['clases'] })
    }

    //Obtengo el perfil del profesor por id
    async obtenerPerfilProfesorId(id: string) : Promise<PerfilProfesor>{
        const perfilProfesor = await this.perfilesProfesoresRepository.findOne(
            { where: {id},
            relations: ['usuario', 'clases'],
        })
        if(!perfilProfesor){
            throw new NotFoundException(`Perfil de profesor con ID ${id} no encontrado`);
        }
        return perfilProfesor;      
    }

    //Obtengo el perfil del profesor por id
    async obtenerPerfilProfesorIdYClase(id: string) : Promise<PerfilProfesor>{
        const perfilProfesor = await this.perfilesProfesoresRepository.findOne({ where: {id}, relations: ['clases'],})
        if(!perfilProfesor){
            throw new NotFoundException(`Perfil de profesor con ID ${id} no encontrado`);
        }
        return perfilProfesor;      
    }



    async modificarPerfilProfesor(id: string, modificarPerfilProfesor: Partial<ModificarPerfilProfesorDto>): Promise<PerfilProfesor>{
        const perfilProfesor = await this.perfilesProfesoresRepository.findOne({ where: { id } });
        if (!perfilProfesor) {
        throw new NotFoundException(`Perfil del profesor con ID ${id} no encontrado`);
        } 
        
        // Verificar si el nombre ya existe en otro perfil
        if (modificarPerfilProfesor.nombre) {
            const existingPerfilProfesor = await this.perfilesProfesoresRepository.findOne({
                where: { nombre: modificarPerfilProfesor.nombre, id: Not(id) },
            });
            if (existingPerfilProfesor) {
                throw new BadRequestException(`El nombre del perfil de profesor "${modificarPerfilProfesor.nombre}" ya existe`);
            }
        }

        Object.assign(perfilProfesor, modificarPerfilProfesor);
        return this.perfilesProfesoresRepository.save(perfilProfesor);
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