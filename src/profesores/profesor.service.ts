// src/profesores/profesor.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profesores } from './profesor.entity';
import { SearchDtoo } from 'src/shared/dto/search.dto';

@Injectable()
export class ProfesorService {
    constructor(
        @InjectRepository(Profesores)
        private readonly profesoresRepository: Repository<Profesores>,
    ) {}

    // Función de búsqueda para profesores
    async searchProfesores(searchDtoo: SearchDtoo): Promise<Profesores[]> {
        const { claseNombre, categoriaNombre, perfilProfesorNombre, descripcion } = searchDtoo;
    
        // Construcción del query para buscar profesores
        const query = this.profesoresRepository.createQueryBuilder('profesor') 
            .leftJoinAndSelect('profesor.categoria', 'categoria') 
            .leftJoinAndSelect('profesor.perfilProfesor', 'perfilProfesor'); 
    
        // Condiciones de búsqueda
        if (claseNombre) {
            query.andWhere('profesor.nombre ILIKE :nombre', { nombre: `%${claseNombre}%` });
        }
    
        if (categoriaNombre) {
            query.andWhere('categoria.nombre ILIKE :categoriaNombre', { categoriaNombre: `%${categoriaNombre}%` });
        }
    
        if (perfilProfesorNombre) {
            query.andWhere('perfilProfesor.nombre ILIKE :perfilProfesorNombre', { perfilProfesorNombre: `%${perfilProfesorNombre}%` });
        }
    
        if (descripcion) {
            query.andWhere('profesor.descripcion ILIKE :descripcion', { descripcion: `%${descripcion}%` });
        }
    
        // Ejecutar la consulta y obtener los resultados
        const profesores = await query.getMany();
        return profesores;
    }
}
