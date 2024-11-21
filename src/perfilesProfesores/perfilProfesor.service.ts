import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { PerfilProfesor } from "./perfilProfesor.entity";
import { CrearPerfilProfesorDto } from "./dto/crear-perfilProfesor.dto";
import { ModificarPerfilProfesorDto } from "./dto/modificar-perfilProfesor.dto";
import { ClasesService } from "src/clases/clase.service";
import { Clase } from "src/clases/clase.entity";

@Injectable()
export class PerfilesProfesoresService{
    constructor (
        @InjectRepository(PerfilProfesor)
        private readonly perfilesProfesoresRepository: Repository<PerfilProfesor>,

        @InjectRepository(Clase)
        private readonly clasesRepository:  Repository<Clase>
    ){}
    //*(cuando inscripciones este listo)
    //GET alumnos inscriptos a la clase del profesor
    

    async crearPerfilProfesor(crearPerfilProfesor: CrearPerfilProfesorDto): Promise<PerfilProfesor>{
        const existingPerfil = await this.perfilesProfesoresRepository.findOne({ where: { nombre: crearPerfilProfesor.nombre } });
            if (existingPerfil) {
                throw new BadRequestException(`El perfil con el nombre "${crearPerfilProfesor.nombre}" ya existe.`);
            }
        const perfilProfesor = await this.perfilesProfesoresRepository.create(crearPerfilProfesor)
        return await this.perfilesProfesoresRepository.save(perfilProfesor)
    }

    //Obtengo todos los perfiles de los profesores
    async obtenerPerfilProfesor(): Promise <PerfilProfesor[]>{
        return await this.perfilesProfesoresRepository.find()
    }

    //Obtengo los perfiles por clases
    async obtenerPerfilProfesorClase(): Promise <PerfilProfesor[]>{
        return await this.perfilesProfesoresRepository.find({ relations: ['clases'] })
    }

    //Obtengo el perfil del profesor por id
    async obtenerPerfilProfesorId(id: string) : Promise<PerfilProfesor>{
        const perfilProfesor = await this.perfilesProfesoresRepository.findOne({ where: {id}})
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



    async modificarPerfilProfesor(id: string, modificarPerfilProfesor: ModificarPerfilProfesorDto): Promise<PerfilProfesor>{
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