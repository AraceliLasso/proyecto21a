import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
        const categoria = this.categoryRepository.create(crearCategoriaDto);
        return await this.categoryRepository.save(categoria);
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