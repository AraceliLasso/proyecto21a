import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Clase } from "./clase.entity";
import { QueryFailedError, Repository } from "typeorm";
import { CrearClaseDto } from "./dto/crear-clase.dto";
import { RespuestaClaseDto } from "./dto/respuesta-clase.dto";
import { CategoriesService } from "src/categorias/categories.service";
import { RespuestaCategoriaDto } from "src/categorias/dto/respuesta-categoria.dto";
import { ModificarClaseDto } from "./dto/modificar-clase.dto";
import { PerfilProfesor } from "src/perfilesProfesores/perfilProfesor.entity";
import { SearchDto } from "./dto/search-logica.dto";
import { CloudinaryService } from "src/file-upload/cloudinary.service";
import { PerfilesProfesoresService } from "src/perfilesProfesores/perfilProfesor.service";
import { Inscripcion } from "src/inscripciones/inscripcion.entity";
import { InscripcionRespuestaDto } from "src/inscripciones/dtos/respuesta-inscripicon.dto";
import { InscripcionesService } from "src/inscripciones/inscripcion.service";
import { rolEnum, Usuario } from "src/usuarios/usuario.entity";
import RespuestaUsuario2Dto from "src/usuarios/dtos/respuestaDos-usuario.dto";
import { plainToClass } from "class-transformer";

@Injectable()
export class ClasesService {
    constructor(
        @InjectRepository(Clase)
        private readonly clasesRepository: Repository<Clase>,
        @InjectRepository(Inscripcion)
        private readonly inscripcionesRepository: Repository<Inscripcion>,
        private readonly categoriesService: CategoriesService,
        private readonly cloudinaryService: CloudinaryService,
        @InjectRepository(PerfilProfesor)
        private readonly perfilProfesorRepository: Repository<PerfilProfesor>,
        @InjectRepository(Usuario)
        private readonly usuariosRepository: Repository<Usuario>,
    ) { }

    // POSTt
    async crear(crearClaseDto: CrearClaseDto, file?: Express.Multer.File): Promise<RespuestaClaseDto> {
        try {
            console.log('Datos del DTO recibidos:', crearClaseDto);
            
            const normalizedName = crearClaseDto.nombre.trim().toLowerCase();
    
            const claseExistente = await this.clasesRepository
                .createQueryBuilder('clase')
                .where('LOWER(clase.nombre) = :nombre', { nombre: normalizedName })
                .getOne();
    
            if (claseExistente) {
                throw new HttpException(
                    `La clase con el nombre "${crearClaseDto.nombre}" ya existe.`,
                    HttpStatus.BAD_REQUEST,
                );
            }
    
            const categoria = await this.categoriesService.findOne(crearClaseDto.categoriaId);
            if (!categoria) {
                throw new NotFoundException(`Categoría con ID ${crearClaseDto.categoriaId} no encontrada`);
            }
            console.log('Categoría encontrada:', categoria);
    
            const perfilProfesor = await this.perfilProfesorRepository.findOne({ where: { id: crearClaseDto.perfilProfesorId } });
            if (!perfilProfesor) {
                throw new NotFoundException(`Perfil del profesor con ID ${crearClaseDto.perfilProfesorId} no encontrado`);
            }
    
            console.log('Perfil del profesor encontrado:', perfilProfesor);
    
            // Subir la imagen si existe un archivo
            let imageUrl: string | undefined;
            if (file) {
                try {
                    // Espera la carga de la imagen
                    imageUrl = await this.cloudinaryService.uploadFile(file.buffer, 'clase', file.originalname);
                    console.log('Archivo subido a Cloudinary:', imageUrl);
                } catch (error) {
                    console.error('Error al subir la imagen a Cloudinary:', error);
                    throw new InternalServerErrorException('Error al subir la imagen');
                }
            }
    
            // Crear la clase directamente con la URL de la imagen si existe
            const nuevaClase = this.clasesRepository.create({
                ...crearClaseDto,
                perfilProfesor,
                categoria,
                imagen: imageUrl,
            });
    
            // Guardar la clase y esperar su confirmación
            const claseGuardada = await this.clasesRepository.save(nuevaClase);
    
            return claseGuardada;
        } catch (error) {
            if (error instanceof QueryFailedError && error.driverError?.code === '23505') {
                throw new HttpException(
                    'Ya existe una clase con ese nombre.',
                    HttpStatus.BAD_REQUEST,
                );
            }
            throw error;
        }
    }
    
    
    


    // GET
    async get(page: number, limit: number) {
        return await this.clasesRepository.find({
            take: limit,
            skip: (page - 1) * limit,
        });
    }

    async findOne(claseId: string): Promise<RespuestaClaseDto> {
        const clase = await this.clasesRepository.findOne({
            where: { id: claseId },
            relations: ['categoria', 'perfilProfesor'],
        });

        console.log('Resultado de la consulta:', clase);

        if (!clase) {
            throw new NotFoundException(`Clase con ID ${claseId} no encontrado`);
        }

        // Crea el DTO de categoría
        const categoryDto = new RespuestaCategoriaDto(clase.categoria.id, clase.categoria.nombre);

        // Devuelve el DTO de producto con el DTO de categoría
        return new RespuestaClaseDto(clase);
    }

    // // PUT
    // async update(id: string, modificarClaseDto: ModificarClaseDto, file?: Express.Multer.File): Promise<RespuestaClaseDto> {
    //     const clase = await this.clasesRepository.findOne({
    //         where: { id }, // Usar un objeto con la propiedad `where`
    //         relations: ['categoria', 'perfilProfesor'], // Cargar la relación de categoría
    //     });

    //     if (!clase) {
    //         throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    //     }

    //     // Verificar si el nombre ya existe en otra clase
    //     if (modificarClaseDto.nombre && modificarClaseDto.nombre.trim()) {
    //         const normalizedName = modificarClaseDto.nombre.trim().toLowerCase();

    //         const claseExistente = await this.clasesRepository
    //             .createQueryBuilder('clase')
    //             .where('LOWER(clase.nombre) = :nombre', { nombre: normalizedName })
    //             .getOne();

    //         if (claseExistente) {
    //             throw new HttpException(
    //                 `Ya existe una clase con el nombre "${modificarClaseDto.nombre}".`,
    //                 HttpStatus.BAD_REQUEST,
    //             );
    //         }
    //     }
    //     // Normalización del nombre antes de guardar
    //     if (modificarClaseDto.nombre) {
    //         clase.nombre = modificarClaseDto.nombre.trim().toLowerCase();
    //     }

    //     // Eliminar la imagen anterior si se proporciona un archivo nuevo
    //     if (file && clase.imagen) {
    //         try {
    //             await this.cloudinaryService.deleteFile(clase.imagen);
    //         } catch (error) {
    //             console.error('Error al eliminar la imagen anterior:', error);
    //             throw new InternalServerErrorException('Error al eliminar la imagen anterior');
    //         }
    //     }

    //     // Subir nueva imagen si se proporciona un archivo
    //     if (file) {
    //         const nuevaImagenUrl = await this.cloudinaryService.uploadFile(file.buffer, file.originalname);
    //         clase.imagen = nuevaImagenUrl; // Reemplazar la URL de la imagen actual
    //     }



    //     // Asignar las propiedades de modificarClaseDto a la clase (sin necesidad de comprobar cada campo manualmente)
    //     Object.assign(clase, modificarClaseDto);

    //     // Verifica si se proporcionó el ID del perfil del profesor y asigna la entidad correspondiente, cuando configure Profesor
    //     if (modificarClaseDto.perfilProfesorId) {
    //         const perfilProfesor = await this.perfilProfesorRepository.findOne({
    //             where: { id: modificarClaseDto.perfilProfesorId },
    //         });
    //         console.log("if (modificarClaseDto.perfilProfesorId)", perfilProfesor)
    //         if (!perfilProfesor) {
    //             throw new NotFoundException(`Perfil de profesor con ID ${modificarClaseDto.perfilProfesorId} no encontrado`);
    //         }
    //         clase.perfilProfesor = perfilProfesor;
    //         console.log("clase.perfilProfesor", perfilProfesor)
    //     } else if (!clase.perfilProfesor) {
    //         // Lanza un error solo si no hay perfil asociado en la entidad actual
    //         throw new InternalServerErrorException('El perfil del profesor es obligatorio para actualizar la clase.');
    //     }

    //     if (modificarClaseDto.categoriaId) {
    //         const categoria = await this.categoriesService.findOne(
    //             modificarClaseDto.categoriaId,
    //         );
    //         if (!categoria) {
    //             throw new NotFoundException(`Categoría con ID ${modificarClaseDto.categoriaId} no encontrada`);
    //         }
    //         clase.categoria = categoria;
    //     }

    //     try {
    //         // Guardar la clase con las actualizaciones realizadas
    //         const modificarclase = await this.clasesRepository.save({
    //             ...clase, // Todos los datos existentes
    //             perfilProfesorId: clase.perfilProfesor.id, // Garantiza que la relación no se pierda
    //         });

    //         // Crear el DTO de respuesta para la categoría
    //         const categoryDto = new RespuestaCategoriaDto(modificarclase.categoria.id, modificarclase.categoria.nombre);

    //         return new RespuestaClaseDto(modificarclase,);
    //     } catch (error) {
    //         if (error instanceof QueryFailedError && error.driverError?.code === '23505') {
    //             throw new HttpException(
    //                 'Ya existe una clase con ese nombre.',
    //                 HttpStatus.BAD_REQUEST,
    //             );
    //         }
    //         throw error;
    //     }
    // }


    async remove(id: string): Promise<string> {
        const result = await this.clasesRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Clase con ID ${id} no encontrada`);
        }
        return `Clase con ID ${id} eliminada exitosamente`;
    }



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


    //Funcion para cambiar de estado activo o no una clase
    async modificarEstado(id: string, estado: boolean): Promise<Clase> {
        const clase = await this.clasesRepository.findOne({ where: { id } });

        if (!clase) {
            throw new NotFoundException('Clase no encontrada');
        }

        clase.estado = estado;
        await this.clasesRepository.save(clase);

        return this.clasesRepository.findOne({ where: { id } });
    }


    async filtrarClasesActivas(): Promise<Clase[]> {
        return this.clasesRepository.find({ where: { estado: true } });
    }


    async obtenerInscripcionesPorClaseId(
        page: number,
        limit: number,
        claseId: string,
    ): Promise<InscripcionRespuestaDto[]> {
        const take = Math.max(1, Math.min(limit, 50)); // Máximo de 50 resultados por página
        const skip = (page - 1) * take;

        // Buscar todas las inscripciones con la relación a la clase
        const inscripciones = await this.inscripcionesRepository.find({
            where: { clase: { id: claseId } }, // Asegúrate de que `clase` es el nombre correcto de la relación
            relations: ['clase', 'usuario'], // Cambia `class` por `clase` si es el nombre real de la relación
            skip,
            take,
        });

        // Si no hay inscripciones, lanzar excepción
        if (!inscripciones.length) {
            throw new NotFoundException(
                `No se encontraron inscripciones para la clase con id: ${claseId}`,
            );
        }

        // Mapear las inscripciones al formato de DTO
        return inscripciones.map((inscripcion) => {
            const { id, fechaInscripcion, fechaVencimiento, estado, clase: entidadClase, usuario: respuestaUsuario} = inscripcion;

            // Transformar la clase al formato esperado
            const claseDto: RespuestaClaseDto = {
                id: entidadClase.id,
                nombre: entidadClase.nombre,
                descripcion: entidadClase.descripcion,
                fecha: entidadClase.fecha,
                disponibilidad: entidadClase.disponibilidad,
            };
            const usuarioDto: RespuestaUsuario2Dto = {
                id: respuestaUsuario.id,
                nombre: respuestaUsuario.nombre,
                email: respuestaUsuario.email,
                telefono: respuestaUsuario.telefono,
                imagen: respuestaUsuario.imagen,
            };

            // Retornar el DTO de la inscripción
            return {
                id,
                fechaInscripcion,
                fechaVencimiento,
                estado,
                clase: claseDto,
                usuario: usuarioDto,
            };
        });

    }
    async obtenerInscripcionesPorProfesor(usuarioId: string) {
        // Verificar si el usuario es un profesor
        const usuario = await this.usuariosRepository.findOne({
            where: { id: usuarioId, rol: rolEnum.PROFESOR },
            relations: ['perfilProfesor'],
        });

        if (!usuario) {
            throw new NotFoundException('El usuario no es un profesor o no existe.');
        }

        // Buscar clases asociadas al perfil del profesor
        const clases = await this.clasesRepository.find({
            where: { perfilProfesor: usuario.perfilProfesor },
            relations: ['inscripciones', 'inscripciones.usuario'],
        });

        if (clases.length === 0) {
            throw new NotFoundException('El profesor no tiene clases asociadas.');
        }

        // Extraer las inscripciones de todas las clases
        const inscripciones = clases.flatMap((clase) =>
            clase.inscripciones.map((inscripcion) => ({
                id: inscripcion.id,
                fechaInscripcion: inscripcion.fechaInscripcion,
                fechaVencimiento: inscripcion.fechaVencimiento,
                estado: inscripcion.estado,
                claseId: clase.id,
                claseNombre: clase.nombre,
                estudianteId: inscripcion.usuario.id,
                estudianteNombre: inscripcion.usuario.nombre,
            })),
        );

        return {
            profesorId: usuario.id,
            nombreProfesor: usuario.nombre,
            clases: clases.map((clase) => ({
                id: clase.id,
                nombre: clase.nombre,
                inscripciones: inscripciones.filter((i) => i.claseId === clase.id),
            })),
        };
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

        // Verificar si el nombre ya existe en otra clase
        if (modificarClaseDto.nombre && modificarClaseDto.nombre.trim()) {
            const normalizedName = modificarClaseDto.nombre.trim().toLowerCase();

            const claseExistente = await this.clasesRepository
                .createQueryBuilder('clase')
                .where('LOWER(clase.nombre) = :nombre', { nombre: normalizedName })
                .getOne();

            if (claseExistente) {
                throw new HttpException(
                    `Ya existe una clase con el nombre "${modificarClaseDto.nombre}".`,
                    HttpStatus.BAD_REQUEST,
                );
            }
        }
        // Normalización del nombre antes de guardar
        if (modificarClaseDto.nombre) {
            clase.nombre = modificarClaseDto.nombre.trim().toLowerCase();
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
            console.log("if (modificarClaseDto.perfilProfesorId)", perfilProfesor)
            if (!perfilProfesor) {
                throw new NotFoundException(`Perfil de profesor con ID ${modificarClaseDto.perfilProfesorId} no encontrado`);
            }
            clase.perfilProfesor = perfilProfesor;
            console.log("clase.perfilProfesor", perfilProfesor)
        } else if (!clase.perfilProfesor) {
            // Lanza un error solo si no hay perfil asociado en la entidad actual
            throw new InternalServerErrorException('El perfil del profesor es obligatorio para actualizar la clase.');
        }

        if (modificarClaseDto.categoriaId) {
            const categoria = await this.categoriesService.findOne(
                modificarClaseDto.categoriaId,
            );
            if (!categoria) {
                throw new NotFoundException(`Categoría con ID ${modificarClaseDto.categoriaId} no encontrada`);
            }
            clase.categoria = categoria;
        }

        try {
            // Guardar la clase con las actualizaciones realizadas
            const modificarclase = await this.clasesRepository.save({
                ...clase, // Todos los datos existentes
                perfilProfesorId: clase.perfilProfesor.id, // Garantiza que la relación no se pierda
            });

            // Crear el DTO de respuesta para la categoría
            const categoryDto = new RespuestaCategoriaDto(modificarclase.categoria.id, modificarclase.categoria.nombre);

            return new RespuestaClaseDto(modificarclase,);
        } catch (error) {
            if (error instanceof QueryFailedError && error.driverError?.code === '23505') {
                throw new HttpException(
                    'Ya existe una clase con ese nombre.',
                    HttpStatus.BAD_REQUEST,
                );
            }
            throw error;
        }
    }


      async obtenerClasePorId(id: string): Promise<RespuestaClaseDto> {
        // Asegúrate de que las relaciones estén cargadas en la consulta
        const clase = await this.clasesRepository.findOne({
            where: { id },
            relations: ['perfilProfesor', 'categoria'], // Carga las relaciones 'perfilProfesor' y 'categoria'
        });

        // Verifica que la clase haya sido encontrada
        if (!clase) {
            throw new NotFoundException(`Clase con ID ${id} no encontrada`);
        }

        // Devuelve la respuesta transformada usando el DTO
        return new RespuestaClaseDto(clase);
    }

    async actualizar(id: string, actualizarClaseDto: ModificarClaseDto, file?: Express.Multer.File): Promise<RespuestaClaseDto> {
        // Buscar la clase por el ID
        const claseExistente = await this.clasesRepository.findOne({ where: { id }, relations: ['perfilProfesor', 'categoria'] });
        if (!claseExistente) {
            throw new NotFoundException('Clase no encontrada');
        }
    
        // Actualizar los campos de la clase con los nuevos datos
        if (actualizarClaseDto.nombre) claseExistente.nombre = actualizarClaseDto.nombre;
        if (actualizarClaseDto.descripcion) claseExistente.descripcion = actualizarClaseDto.descripcion;
        if (actualizarClaseDto.fecha) claseExistente.fecha = actualizarClaseDto.fecha;
        if (typeof actualizarClaseDto.disponibilidad === 'number') claseExistente.disponibilidad = actualizarClaseDto.disponibilidad;
        if (actualizarClaseDto.categoriaId) claseExistente.categoriaId = actualizarClaseDto.categoriaId;

    
        // Buscar el perfil del profesor a partir del ID
        if (actualizarClaseDto.perfilProfesorId) {
            const perfilProfesor = await this.perfilProfesorRepository.findOne({ where: { id: actualizarClaseDto.perfilProfesorId } });
            if (!perfilProfesor) {
                throw new NotFoundException('Perfil de profesor no encontrado');
            }
            claseExistente.perfilProfesor = perfilProfesor; // Asignamos la instancia del profesor a la clase
        }
    
        // Si se sube una nueva imagen, actualizarla
        if (file) {
                    // Eliminar la imagen anterior si existe
                    console.log('Archivo recibido en el servicio:', file);
                    if (claseExistente.imagen) {
                        try {
                        await this.cloudinaryService.deleteFile(claseExistente.imagen);
                    } catch (error) {
                    console.error('Error al manejar la imagen:', error);
                    throw new InternalServerErrorException('Error al manejar la imagen');
                }
            }

                try{
                    // Subir la nueva imagen
                    const nuevaImagenUrl = await this.cloudinaryService.uploadFile(
                        file.buffer,
                        'clase',
                        file.originalname,
                    );
                    claseExistente.imagen = nuevaImagenUrl; // Asignar la nueva URL de la imagen
                } catch (error) {
                    console.error('Error al subir la nueva imagen:', error);
                    throw new InternalServerErrorException('Error al subir la nueva imagen');
                }
            }
    
        // Guardar los cambios en la base de datos
        await this.clasesRepository.save(claseExistente);
    
        // Devolver el DTO con la clase actualizada
        return new RespuestaClaseDto(claseExistente); // Se asegura que se devuelve un DTO
    }
    
    
    // async actualizarClase(
    //     id: string,
    //     modificarClaseDto: ModificarClaseDto,
    //     imagen?: Express.Multer.File, // Parámetro opcional para la imagen
    // ): Promise<RespuestaClaseDto> {
    //     // Buscar la clase por ID
    //     const clase = await this.clasesRepository.findOne({
    //         where: { id },
    //         relations: ['perfilProfesor', 'categoria'], // Asegúrate de cargar las relaciones
    //     });

    //     if (!clase) {
    //         // Si no se encuentra la clase, lanzamos una excepción
    //         throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    //     }

    //     // Actualizar los datos de la clase con los valores del DTO
    //     Object.assign(clase, modificarClaseDto);

    //     // Si se proporcionó una nueva imagen, actualizamos la propiedad 'imagen'
    //     if (imagen) {
    //         // Asegúrate de que el archivo sea procesado correctamente
    //         clase.imagen = imagen.path; // O el nombre del archivo según tu lógica
    //     }

    //     // Guardar la clase actualizada en la base de datos
    //     await this.clasesRepository.save(clase);

    //     // Convertir la clase a un DTO de respuesta y devolverla
    //     return new RespuestaClaseDto(clase);
    // }
    
}    