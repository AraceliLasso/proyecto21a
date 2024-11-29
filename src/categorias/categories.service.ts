import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { Categoria } from "./categories.entity";
import { CrearCategoriaDto } from "./dto/crear-categoria.dto";
import { Clase } from "src/clases/clase.entity";
import { ModificarCategoriaDto } from "./dto/modificar-categoria.dto";


@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Categoria)
        private readonly categoryRepository: Repository<Categoria>,
    ) {}

    async create(crearCategoriaDto: CrearCategoriaDto): Promise<Categoria> {
        try{
        // Normalizar el nombre a minúsculas
    const normalizedName = crearCategoriaDto.nombre.trim().toLowerCase();

    // Verificar si existe una categoría con el mismo nombre normalizado
    const existingCategory = await this.categoryRepository
    .createQueryBuilder('categoria')
    .where('LOWER(categoria.nombre) = :nombre', { nombre: normalizedName })
    .getOne();

    if (existingCategory) {
        // Lanza un error si ya existe una categoría con ese nombre
        throw new HttpException(`La categoría "${crearCategoriaDto.nombre}" ya existe.`, HttpStatus.BAD_REQUEST);
    }

    // Si no existe, crea y guarda la nueva categoría
    const categoria = this.categoryRepository.create({
        ...crearCategoriaDto,
        nombre: crearCategoriaDto.nombre.trim(), // Asegúrate de guardar el nombre normalizado
    });

    return await this.categoryRepository.save(categoria);
} catch (error) {
    if (error instanceof QueryFailedError && error.driverError?.code === '23505') {
        // Error de unicidad detectado (código específico de PostgreSQL)
        throw new HttpException(
            'Ya existe una categoría con ese nombre.',
            HttpStatus.BAD_REQUEST,
        );
    }
    // Si el error no es de unicidad, lánzalo tal como está
    throw error;
}
    }

    async findAll(): Promise<Categoria[]> {
        return await this.categoryRepository.find();
    }

    async findOne(id: string): Promise<Categoria> {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new NotFoundException(`Categoria con ID ${id} no encontrada`);
        }
        return category;
    }

    //Gestion de Search
    async findClasesByCategory(categoryId: string): Promise<Clase[]> {
        const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
        relations: ['clases'],
        });
        if (!category) {
        throw new HttpException("Categoria no encontrada", HttpStatus.NOT_FOUND);
        }
      return category.clases; // Esto devuelve un array de clases
    }

    async update(id: string, modificarCategoriaDto: ModificarCategoriaDto): Promise<Categoria> {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
        } 
        
        // Verificar si el nombre ya existe en otra categoría
        if (modificarCategoriaDto.nombre) {
            const existingCategory = await this.categoryRepository.findOne({
                where: { nombre: modificarCategoriaDto.nombre },
            });
            if (existingCategory && existingCategory.id !== id) {
                throw new BadRequestException(`El nombre de la categoría "${modificarCategoriaDto.nombre}" ya existe`);
            }
        }

        Object.assign(category, modificarCategoriaDto);
        return this.categoryRepository.save(category);
    }


    async cambiarEstadoCategoria(id: string, estado: boolean): Promise<Categoria> {
        console.log('Buscando categoria con ID:', id);
        const categoria = await this.categoryRepository.findOne({ where: { id } });
    
        console.log('Categoria encontrada:', categoria);
        if (!categoria) {
            throw new NotFoundException(`Categoria con ID ${id} no encontrada`);
        }
    
        // Cambiar el estado lógico
        categoria.estado = estado;
        await this.categoryRepository.save(categoria);
    
        return categoria;
    }


    async obtenerCategoriasActivas(): Promise <Categoria[]>{
        
        return await this.categoryRepository.find({
            where: { clases: { estado: true } },
    })
    }

    async removeCategory(id: string): Promise<string> {
        const categoria = await this.findOne(id);
        if (!categoria) {
            throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
        }
        const nombreCategoria = categoria.nombre;
        await this.categoryRepository.remove(categoria);
        return `Categoría "${nombreCategoria}" eliminada exitosamente`;
    }


    }       