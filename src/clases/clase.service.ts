import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Clase } from "./clase.entity";
import { Repository } from "typeorm";
import { CrearClaseDto } from "./dto/crear-clase.dto";
import { RespuestaClaseDto } from "./dto/respuesta-clase.dto";
import { CategoriesService } from "src/categorias/categories.service";
import { RespuestaCategoriaDto } from "src/categorias/dto/respuesta-categoria.dto";
import { ModificarClaseDto } from "./dto/modificar-clase.dto";
import { PerfilProfesor } from "src/perfilesProfesores/perfilProfesor.entity";
import { SearchDto } from "./dto/search-logica.dto";

@Injectable()
export class ClasesService{
    constructor (
        @InjectRepository(Clase)
        private readonly clasesRepository: Repository<Clase>,
        private readonly categoriesService: CategoriesService,

        @InjectRepository(PerfilProfesor)
        private readonly perfilProfesorRepository: Repository<PerfilProfesor>,
    ){}

    // POST
    async crear(crearClaseDto: CrearClaseDto): Promise<RespuestaClaseDto> {
        const categoria = await this.categoriesService.findOne(crearClaseDto.categoriaId);
        if (!categoria) {
            throw new NotFoundException(`Categoría con ID ${crearClaseDto.categoriaId} no encontrada`);
        }
        const clase = this.clasesRepository.create({
            ...crearClaseDto,
            categoriaId : crearClaseDto.categoriaId,
        });
    
        try {
            const savedClase = await this.clasesRepository.save(clase);
            return new RespuestaClaseDto(savedClase, {
            id: categoria.id,
            nombre: categoria.nombre,
            });
        } catch (error) {
            console.error('Error al crear el producto:', error);
            throw new InternalServerErrorException('Error al guardar el producto');
        }
        } 

     // GET
        async get(page: number, limit: number) {
        return await this.clasesRepository.find({
            take: limit,
            skip: (page - 1) * limit,
        });
    }

    async findOne(id: string): Promise<RespuestaClaseDto> {
        const clase = await this.clasesRepository.findOne({
            where: { id },
            relations: ['categoria'], // Carga la relación de categoría
        });
        if (!clase) {
            throw new NotFoundException(`Clase con ID ${id} no encontrado`);
        }

        // Crea el DTO de categoría
        const categoryDto = new RespuestaCategoriaDto(clase.categoria.id, clase.categoria.nombre);

        // Devuelve el DTO de producto con el DTO de categoría
        return new RespuestaClaseDto(clase, categoryDto);
    }

    // PUT
    async update(id: string, modificarClaseDto: ModificarClaseDto): Promise<RespuestaClaseDto> {
        const clase = await this.clasesRepository.findOne({
            where: { id }, // Usar un objeto con la propiedad `where`
            relations: ['categoria', 'perfilProfesor'], // Cargar la relación de categoría
        });

        if (!clase) {
            throw new NotFoundException(`Clase con ID ${id} no encontrada`);
        }

        // Actualiza los campos de la clase
        if (modificarClaseDto.nombre) clase.nombre = modificarClaseDto.nombre;
        if (modificarClaseDto.descripcion) clase.descripcion = modificarClaseDto.descripcion;
        if (modificarClaseDto.fecha) clase.fecha = modificarClaseDto.fecha;
        if (modificarClaseDto.disponibilidad) clase.disponibilidad = modificarClaseDto.disponibilidad;
        if (modificarClaseDto.imagen) clase.imagen = modificarClaseDto.imagen;
        if (modificarClaseDto.categoriaId) clase.categoriaId = modificarClaseDto.categoriaId;
        
        // Verifica si se proporcionó el ID del perfil del profesor y asigna la entidad correspondiente, cuando configure Profesor
        if (modificarClaseDto.perfilProfesorId) {
            const perfilProfesor = await this.perfilProfesorRepository.findOne({
                where: { id: modificarClaseDto.perfilProfesorId },
            });
            if (!perfilProfesor) {
                throw new NotFoundException(`Perfil de profesor con ID ${modificarClaseDto.perfilProfesorId} no encontrado`);
            }
            clase.perfilProfesor = perfilProfesor;
        }


        const modificarclase = await this.clasesRepository.save(clase);
        const categoryDto = new RespuestaCategoriaDto(modificarclase.categoria.id, modificarclase.categoria.nombre);

        return new RespuestaClaseDto(modificarclase, categoryDto);
    }

        async remove(id: string): Promise<string> {
        const result = await this.clasesRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Clase con ID ${id} no encontrada`);
        }
        return `Clase con ID ${id} eliminada exitosamente`;
    }
    async searchClases(searchDto: SearchDto): Promise<Clase[]> {
        const { claseNombre, categoriaNombre, perfilProfesorNombre, descripcion } = searchDto;

        // Crear un array de promesas
        const queries = [];

        if (claseNombre) {
            queries.push(
                this.clasesRepository.createQueryBuilder('clase')
                    .where('clase.nombre ILIKE :nombre', { nombre: `%${claseNombre}%` })
                    .getMany(),
            );
        }

        if (categoriaNombre) {
            queries.push(
                this.clasesRepository.createQueryBuilder('clase')
                    .innerJoinAndSelect('clase.categoria', 'categoria')
                    .where('categoria.nombre ILIKE :categoriaNombre', { categoriaNombre: `%${categoriaNombre}%` })
                    .getMany(),
            );
        }
        if (perfilProfesorNombre) {
            queries.push(
                this.clasesRepository.createQueryBuilder('clase')
                    .innerJoinAndSelect('clase.perfilProfesor', 'perfilProfesor')
                    .where('perfilProfesor.nombre ILIKE :perfilProfesorNombre', { perfilProfesorNombre: `%${perfilProfesorNombre}%` })
                    .getMany(),
            );
        }

        if (descripcion) {
            queries.push(
                this.clasesRepository.createQueryBuilder('clase')
                    .where('clase.descripcion ILIKE :descripcion', { descripcion: `%${descripcion}%` })
                    .getMany(),
            );
        }

        const resultados = await Promise.all(queries);
        const clasesUnicas = Array.from(new Set(resultados.flat().map(clase => clase.id)))
            .map(id => resultados.flat().find(clase => clase.id === id));

        return clasesUnicas;
    }

}