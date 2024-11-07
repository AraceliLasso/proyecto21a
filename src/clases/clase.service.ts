import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Clase } from "./clase.entity";
import { Repository } from "typeorm";
import { CrearClaseDto } from "./dto/crear-clase.dto";
import { RespuestaClaseDto } from "./dto/respuesta-clase.dto";
import { CategoriesService } from "src/categorias/categories.service";
import { RespuestaCategoriaDto } from "src/categorias/dto/respuesta-categoria.dto";

@Injectable()
export class ClasesService{
    constructor (
        @InjectRepository(Clase)
        private readonly clasesRepository: Repository<Clase>,
        private readonly categoriesService: CategoriesService
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
    // PATCH
    // DELETE
}