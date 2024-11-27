import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
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
import { CloudinaryService } from "src/file-upload/cloudinary.service";
import { PerfilesProfesoresService } from "src/perfilesProfesores/perfilProfesor.service";

@Injectable()
export class ClasesService{
    constructor (
        @InjectRepository(Clase)
        private readonly clasesRepository: Repository<Clase>,
        private readonly categoriesService: CategoriesService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly perfilesProfesoresService: PerfilesProfesoresService,

        @InjectRepository(PerfilProfesor)
        private readonly perfilProfesorRepository: Repository<PerfilProfesor>,
    ){}

    // POST
    async crear(crearClaseDto: CrearClaseDto, file?: Express.Multer.File): Promise<RespuestaClaseDto> {
        console.log('Datos del DTO recibidos:', crearClaseDto);
    
        // Validar si ya existe una clase con el mismo nombre
        const claseExistente = await this.clasesRepository.findOne({
            where: { nombre: crearClaseDto.nombre },
        });

        if (claseExistente) {
            throw new ConflictException(`La clase con el nombre '${crearClaseDto.nombre}' ya existe.`);
        }


        const categoria = await this.categoriesService.findOne(crearClaseDto.categoriaId);
        if (!categoria) {
            throw new NotFoundException(`Categoría con ID ${crearClaseDto.categoriaId} no encontrada`);
        }
        console.log('Categoría encontrada:', categoria);

        // Validar el perfil del profesor
        const perfilProfesor = await this.perfilesProfesoresService.obtenerPerfilProfesorId(crearClaseDto.perfilProfesorId);
        if (!perfilProfesor) {
            throw new NotFoundException(`Perfil del profesor con ID ${crearClaseDto.perfilProfesorId} no encontrado`);
        }

        if (!crearClaseDto.perfilProfesorId) {
            throw new Error('El perfilProfesorId es requerido y no puede ser nulo.');
        }

        console.log('Perfil del profesor encontrado:', perfilProfesor);
    
        let imageUrl: string | undefined;
        if(file){
        try {
            // Subir la imagen a Cloudinary y obtener la URL
            imageUrl = await this.cloudinaryService.uploadFile(file.buffer, file.originalname);
            console.log('Archivo subido a URL:', imageUrl);
        } catch (error) {
            console.error('Error al subir la imagen a Cloudinary:', error);
            throw new InternalServerErrorException('Error al subir la imagen');
        }
    }

    const nuevaClase = await this.clasesRepository.save({
        ...crearClaseDto,
        perfilProfesor,
        perfilProfesorId: perfilProfesor.id,
        categoria,
        imagen: imageUrl
    });
    
    console.log("Nueva clase en service", nuevaClase)

    // try {
    //     await this.clasesRepository.save(nuevaClase);
    // } catch (error) {
    //     console.error('Error al guardar la clase:', error);
    //     throw new InternalServerErrorException('No se pudo guardar la clase');
    // }


    
    // Cargar las relaciones explícitamente
    const claseConRelaciones = await this.clasesRepository.findOne({
        where: { id: nuevaClase.id },
        relations: ['perfilProfesor', 'categoria'],
    });

    console.log("ClaseConRelaciones", claseConRelaciones)
    return claseConRelaciones;
    
    }
    // Crear y guardar la clase
//     const clase = await this.clasesRepository.save({
//         nombre: crearClaseDto.nombre,
//         descripcion: crearClaseDto.descripcion,
//         fecha: crearClaseDto.fecha,
//         disponibilidad: crearClaseDto.disponibilidad,
//         imagen: imageUrl,
//         categoria: { id: crearClaseDto.categoriaId },
//         perfilProfesor: { id: crearClaseDto.perfilProfesorId },
//     });

//     console.log('Clase guardada sin relaciones:', clase);


//     // Cargar las relaciones necesarias
//     const claseConRelaciones = await this.clasesRepository.findOne({
//         where: { id: clase.id },
//         relations: ['perfilProfesor', 'categoria'],
//     });

//     console.log('Clase guardada con relaciones:', claseConRelaciones);

//     if (!claseConRelaciones) {
//         throw new InternalServerErrorException('Error al cargar las relaciones de la clase');
//     }

//     // Devolver el DTO de respuesta
//     return new RespuestaClaseDto(claseConRelaciones);
// }

        // const clase = this.clasesRepository.create({
        //     ...crearClaseDto,
        //     categoria,
        //     perfilProfesor,
        //     imagen: imageUrl, // Asignar la URL de la imagen si se proporcionó
        // });
    
        // console.log('Datos de la clase preparados para guardar:', clase);
        // try {
        //     const savedClase = await this.clasesRepository.save(clase);
        //     return new RespuestaClaseDto(savedClase, {
        //     id: categoria.id,
        //     nombre: categoria.nombre,
        //     });
        // } catch (error) {
        //     console.error('Error al crear el producto:', error);
        //     throw new InternalServerErrorException('Error al guardar el producto');
        // }
        // } 

     // GET
        async get(page: number, limit: number) {
        return await this.clasesRepository.find({
            take: limit,
            skip: (page - 1) * limit,
        });
    }

    async findOne(id: string, options?: { relations: string[] }): Promise<RespuestaClaseDto> {
        const clase = await this.clasesRepository.findOne({
            where: { id },
            relations: options?.relations || ['categoria', 'perfilProfesor'], 
        });

        console.log('Resultado de la consulta:', clase);

        if (!clase) {
            throw new NotFoundException(`Clase con ID ${id} no encontrado`);
        }

        // Crea el DTO de categoría
        const categoryDto = new RespuestaCategoriaDto(clase.categoria.id, clase.categoria.nombre);

        // Devuelve el DTO de producto con el DTO de categoría
        return new RespuestaClaseDto(clase, categoryDto);
    }

    // PUT
    async update(id: string, modificarClaseDto: ModificarClaseDto, file?: Express.Multer.File): Promise<RespuestaClaseDto> {
        const clase = await this.clasesRepository.findOne({
            where: { id }, // Usar un objeto con la propiedad `where`
            relations: ['categoria', 'perfilProfesor'], // Cargar la relación de categoría
        });

        if (!clase) {
            throw new NotFoundException(`Clase con ID ${id} no encontrada`);
        }
        
        // Eliminar la imagen anterior si se proporciona un archivo nuevo
        if (file && clase.imagen) {
        try {
            await this.cloudinaryService.deleteFile(clase.imagen);
        } catch (error) {
            console.error('Error al eliminar la imagen anterior:', error);
            throw new InternalServerErrorException('Error al eliminar la imagen anterior');
        }
    }

        // Subir nueva imagen si se proporciona un archivo
        if (file) {
            const nuevaImagenUrl = await this.cloudinaryService.uploadFile(file.buffer, file.originalname);
            clase.imagen = nuevaImagenUrl; // Reemplazar la URL de la imagen actual
        }



        // Asignar las propiedades de modificarClaseDto a la clase (sin necesidad de comprobar cada campo manualmente)
        Object.assign(clase, modificarClaseDto);
            
        // Verifica si se proporcionó el ID del perfil del profesor y asigna la entidad correspondiente, cuando configure Profesor
        if (modificarClaseDto.perfilProfesorId) {
            const perfilProfesor = await this.perfilProfesorRepository.findOne({
                where: { id: modificarClaseDto.perfilProfesorId },
            });
            if (!perfilProfesor) {
                throw new NotFoundException(`Perfil de profesor con ID ${modificarClaseDto.perfilProfesorId} no encontrado`);
            }
            clase.perfilProfesor = perfilProfesor;
        }else if (!clase.perfilProfesor) {
            // Lanza un error solo si no hay perfil asociado en la entidad actual
            throw new InternalServerErrorException('El perfil del profesor es obligatorio para actualizar la clase.');
        }

        if (modificarClaseDto.categoriaId) {
            const categoria = await this.categoriesService.findOne(
                modificarClaseDto.categoriaId ,
            );
            if (!categoria) {
                throw new NotFoundException(`Categoría con ID ${modificarClaseDto.categoriaId} no encontrada`);
            }
            clase.categoria = categoria;
        }

        Object.assign(clase, modificarClaseDto);
        
        try{
            // Guardar la clase con las actualizaciones realizadas
        const modificarclase = await this.clasesRepository.save({
            ...clase, // Todos los datos existentes
            perfilProfesor: clase.perfilProfesor, // Garantiza que la relación no se pierda
        });

        // Crear el DTO de respuesta para la categoría
        const categoryDto = new RespuestaCategoriaDto(modificarclase.categoria.id, modificarclase.categoria.nombre);

        return new RespuestaClaseDto(modificarclase, categoryDto);
        }catch (error){
            console.error('Error al actualizar la clase:', error);
            throw new InternalServerErrorException('Error al actualizar la clase');
        }
    }

        async remove(id: string): Promise<string> {
        const result = await this.clasesRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Clase con ID ${id} no encontrada`);
        }
        return `Clase con ID ${id} eliminada exitosamente`;
    }

    // async searchClases(searchDto: SearchDto): Promise<Clase[]> {
    //     const { claseNombre, categoriaNombre, perfilProfesorNombre, descripcion } = searchDto;

    //     // Crear un array de promesas
    //     const queries = [];

    //     if (claseNombre) {
    //         queries.push(
    //             this.clasesRepository.createQueryBuilder('clase')
    //                 .where('clase.nombre ILIKE :nombre', { nombre: `%${claseNombre}%` })
    //                 .getMany(),
    //         );
    //     }

    //     if (categoriaNombre) {
    //         queries.push(
    //             this.clasesRepository.createQueryBuilder('clase')
    //                 .innerJoinAndSelect('clase.categoria', 'categoria')
    //                 .where('categoria.nombre ILIKE :categoriaNombre', { categoriaNombre: `%${categoriaNombre}%` })
    //                 .getMany(),
    //         );
    //     }
    //     if (perfilProfesorNombre) {
    //         queries.push(
    //             this.clasesRepository.createQueryBuilder('clase')
    //                 .innerJoinAndSelect('clase.perfilProfesor', 'perfilProfesor')
    //                 .where('perfilProfesor.nombre ILIKE :perfilProfesorNombre', { perfilProfesorNombre: `%${perfilProfesorNombre}%` })
    //                 .getMany(),
    //         );
    //     }

    //     if (descripcion) {
    //         queries.push(
    //             this.clasesRepository.createQueryBuilder('clase')
    //                 .where('clase.descripcion ILIKE :descripcion', { descripcion: `%${descripcion}%` })
    //                 .getMany(),
    //         );
    //     }

    //     const resultados = await Promise.all(queries);
    //     const clasesUnicas = Array.from(new Set(resultados.flat().map(clase => clase.id)))
    //         .map(id => resultados.flat().find(clase => clase.id === id));

    //     return clasesUnicas;
    // }

    async searchClases(searchDto: SearchDto): Promise<Clase[]> {
        const { claseNombre, categoriaNombre, perfilProfesorNombre, descripcion } = searchDto;
    
        const query = this.clasesRepository.createQueryBuilder('clase')
            .leftJoinAndSelect('clase.categoria', 'categoria')
            .leftJoinAndSelect('clase.perfilProfesor', 'perfilProfesor');
    
        if (claseNombre) {
            query.andWhere('clase.nombre ILIKE :nombre', { nombre: `%${claseNombre}%` });
        }
    
        if (categoriaNombre) {
            query.andWhere('categoria.nombre ILIKE :categoriaNombre', { categoriaNombre: `%${categoriaNombre}%` });
        }
    
        if (perfilProfesorNombre) {
            query.andWhere('perfilProfesor.nombre ILIKE :perfilProfesorNombre', { perfilProfesorNombre: `%${perfilProfesorNombre}%` });
        }
    
        if (descripcion) {
            query.andWhere('clase.descripcion ILIKE :descripcion', { descripcion: `%${descripcion}%` });
        }
    
        const clases = await query.getMany();
        return clases;
    }


    //Solo actualiza la imagen, no esta en funcionamiento, se usa update
    async modificarImagenClase(claseId: string, imagen: string): Promise<void> {
        await this.clasesRepository.update(claseId, { imagen });
    }

}