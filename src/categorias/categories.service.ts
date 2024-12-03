import { BadRequestException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QueryFailedError, Repository } from "typeorm";
import { Categoria } from "./categories.entity";
import { CrearCategoriaDto } from "./dto/crear-categoria.dto";
import { Clase } from "src/clases/clase.entity";
import { ModificarCategoriaDto } from "./dto/modificar-categoria.dto";
import { SearchDto } from "src/clases/dto/search-logica.dto";
import { CloudinaryService } from "src/file-upload/cloudinary.service";


@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Categoria)
        private readonly categoryRepository: Repository<Categoria>,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    async create(crearCategoriaDto: CrearCategoriaDto, file?: Express.Multer.File): Promise<Categoria> {
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

    let imageUrl: string | undefined;
        if(file){
        try {
            // Subir la imagen a Cloudinary y obtener la URL
            imageUrl = await this.cloudinaryService.uploadFile(file.buffer, 'categoria', file.originalname);
            console.log('Archivo subido a URL:', imageUrl);
        } catch (error) {
            console.error('Error al subir la imagen a Cloudinary:', error);
            throw new InternalServerErrorException('Error al subir la imagen');
        }
    }

    
    // Si no existe, crea y guarda la nueva categoría
    const categoria = this.categoryRepository.create({
        //...crearCategoriaDto,
        nombre: crearCategoriaDto.nombre.trim(), // Asegúrate de guardar el nombre normalizado
        imagen: imageUrl
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

    async findOneActiva(id: string): Promise<Categoria> {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category.estado) {
            throw new NotFoundException(`Categoria con ID ${id} no encontrada`);
        }
        return category;
    }

    async findOne(id: string): Promise<Categoria> {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new NotFoundException(`Categoria con ID ${id} no encontrada`);
        }
        return category;
    }

    //Gestion de Search
    async findClasesByCategory(categoryId: string): Promise<any> {
        const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
        relations: ['clases'],
        });

        if (!category.estado) {
        throw new HttpException("Categoria no encontrada", HttpStatus.NOT_FOUND);
        }

        // Filtra las clases activas
        const clasesActivas = category.clases.filter(clase => clase.estado); // Ajusta el campo según tu entidad

        // Devuelve la información de la categoría activa con sus clases activas
        return {
        id: category.id,
        nombre: category.nombre, // Asegúrate de que estos campos existan en tu entidad
        clases: clasesActivas,
    };

    }

    async update(id: string, modificarCategoriaDto: ModificarCategoriaDto, file?: Express.Multer.File): Promise<Categoria> {
        
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
        } 

        // Si no se proporciona ningún dato válido, lanzar un error
        if (!modificarCategoriaDto.nombre && !file) {
            throw new BadRequestException('No se proporcionaron datos para actualizar la categoría.');
        }
        
        // Verificar si el nombre ya existe en otra categoría
        if (modificarCategoriaDto.nombre) {
            const normalizedNombre = modificarCategoriaDto.nombre.trim().toLowerCase();// Normaliza a minúsculas
            // Buscar si ya existe otra categoría con el mismo nombre (ignorando mayúsculas)
            const existingCategory = await this.categoryRepository.findOne({
                where: { nombre: normalizedNombre},
            });
            if (existingCategory && existingCategory.id !== id) {
                throw new BadRequestException(`El nombre de la categoría "${modificarCategoriaDto.nombre}" ya existe`);
            }

            // Verificar si el nombre propuesto es igual al actual al normalizarlo
            if (category.nombre.toLowerCase() === normalizedNombre) {
                throw new BadRequestException(`El nombre de la categoría "${modificarCategoriaDto.nombre}" ya existe`);
            }

            // Asignar el nombre normalizado
            category.nombre = modificarCategoriaDto.nombre.trim();
        }
        

            if (file) {
                    // Eliminar la imagen anterior si existe
                    console.log('Archivo recibido en el servicio:', file);
                    if (category.imagen) {
                        try {
                        await this.cloudinaryService.deleteFile(category.imagen);
                    } catch (error) {
                    console.error('Error al manejar la imagen:', error);
                    throw new InternalServerErrorException('Error al manejar la imagen');
                }
            }

                try{
                    // Subir la nueva imagen
                    const nuevaImagenUrl = await this.cloudinaryService.uploadFile(
                        file.buffer,
                        'categoria',
                        file.originalname,
                    );
                    category.imagen = nuevaImagenUrl; // Asignar la nueva URL de la imagen
                } catch (error) {
                    console.error('Error al subir la nueva imagen:', error);
                    throw new InternalServerErrorException('Error al subir la nueva imagen');
                }
            }
        

        // Actualizar los demás campos proporcionados
        // Object.keys(modificarCategoriaDto).forEach((key) => {
        //     if (modificarCategoriaDto[key] !== undefined && key !== 'nombre') {
        //         (category as any)[key] = modificarCategoriaDto[key];
        //     }
        // });
            //Object.assign(category, modificarCategoriaDto);

        try {
            return await this.categoryRepository.save(category);
        } catch (error) {
            if (error instanceof QueryFailedError && error.driverError?.code === '23505') {
                throw new HttpException(
                    'Ya existe una categoría con ese nombre.',
                    HttpStatus.BAD_REQUEST,
                );
            }
            throw error;
    }
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
    async searchCategorias(searchDto: SearchDto): Promise<Categoria[]> {
        const { categoriaNombre, descripcion } = searchDto;
    
        const query = this.categoryRepository.createQueryBuilder('categoria')
            .leftJoinAndSelect('categoria.clases', 'clase') // Relación con clases
            .leftJoinAndSelect('categoria.perfilProfesor', 'perfilProfesor'); // Relación opcional
    
        if (categoriaNombre) {
            query.andWhere('categoria.nombre ILIKE :categoriaNombre', { categoriaNombre: `%${categoriaNombre}%` });
        }
    
        if (descripcion) {
            query.andWhere('categoria.descripcion ILIKE :descripcion', { descripcion: `%${descripcion}%` });
        }
    
        const categorias = await query.getMany();
        return categorias;
    }

    }       