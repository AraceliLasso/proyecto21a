import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { EstadoInscripcion, Inscripcion } from "./inscripcion.entity";
import { CrearInscripcionDto } from "./dtos/crear-inscripcion.dto";
import { Usuario } from "src/usuarios/usuario.entity";
import { Clase } from "src/clases/clase.entity";
import { MembresiaService } from "src/membresias/membresia.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Membresia } from "src/membresias/membresia.entity";
import { Categoria } from "src/categorias/categories.entity";
import { InscripcionRespuestaDto } from "./dtos/respuesta-inscripicon.dto";
import { InscripcionConClaseDto } from "./dtos/conClase-inscripcion.dto";
import { PerfilProfesor } from "src/perfilesProfesores/perfilProfesor.entity";

@Injectable()
export class InscripcionesService {
    constructor(
        @InjectRepository(Inscripcion)
        private readonly inscripcionesRepository: Repository<Inscripcion>,
        @InjectRepository(Usuario)
        private readonly usuariosRepository: Repository<Usuario>,
        @InjectRepository(Clase)
        private readonly clasesRepository: Repository<Clase>,
        private readonly membresiaService: MembresiaService,

    ) { }
    async crearInscripcion(crearInscripcionDto: CrearInscripcionDto): Promise<Inscripcion> {
        const { usuarioId, claseId } = crearInscripcionDto;

        // Verificar si el usuario existe
        const usuario = await this.usuariosRepository.findOne({ where: { id: usuarioId } });
        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Verificar si la clase existe
        const clase = await this.clasesRepository.findOne({ where: { id: claseId } });
        if (!clase) {
            throw new NotFoundException('Clase no encontrada');
        }

        // Verificar si la clase tiene disponibilidad
        if (clase.disponibilidad <= 0) {
            throw new BadRequestException('La clase no tiene cupos disponibles');
        }

        // Verificar si el usuario tiene una membresía activa
        const membresiaActiva = await this.membresiaService.obtenerMembresiaActivaPorUsuario(usuarioId);
        if (!membresiaActiva) {
            throw new BadRequestException('El usuario no tiene una membresía activa');
        }

        // Crear la inscripción
        const inscripcion = this.inscripcionesRepository.create({
            usuario,
            clase,
            fechaInscripcion: new Date(), // Asignamos la fecha actual de inscripción
            fechaVencimiento: membresiaActiva.fechaExpiracion, // Asumimos que la membresía tiene una fecha de vencimiento
        });

        // Reducir la disponibilidad de la clase
        clase.disponibilidad -= 1;
        await this.clasesRepository.save(clase); // Guardamos la clase con la nueva disponibilidad

        // Guardar la inscripción
        return this.inscripcionesRepository.save(inscripcion);
    }


    // Actualizar el estado de la inscripción
    async actualizarEstadoInscripcion(usuarioId: string, claseId: string): Promise<string> {
        const inscripcion = await this.inscripcionesRepository.findOne({
            where: { usuario: { id: usuarioId }, clase: { id: claseId } },
            relations: ['usuario', 'clase'],
        });

        if (!inscripcion) {
            throw new NotFoundException('No se encontró la inscripción');
        }

        // Verificar que el usuario tenga una membresía activa
        const membresiaActiva = await this.membresiaService.obtenerMembresiaActivaPorUsuario(usuarioId);
        if (!membresiaActiva) {
            throw new BadRequestException('El usuario no tiene una membresía activa');
        }

        // Actualizar el estado de la inscripción a 'INACTIVA' (valor predefinido)
        inscripcion.estado = EstadoInscripcion.INACTIVA;
        await this.inscripcionesRepository.save(inscripcion);

        return `Estado de la inscripción actualizado a INACTIVA`;
    }
    async obtenerInscripcionesActivasPorUsuario(usuarioId: string): Promise<Inscripcion[]> {
        return this.inscripcionesRepository.find({
            where: {
                usuario: { id: usuarioId },
                estado: EstadoInscripcion.ACTIVA,
            },
            relations: ['clase'], // Cargar la relación con las clases
        });
    }
    // Obtener las inscripciones de un usuario específico junto con la clase asociada.
    async obtenerInscripcionesConClase(usuarioId: string) {
        // Buscar todas las inscripciones del usuario y cargar las clases asociadas
        const inscripciones = await this.inscripcionesRepository.find({
          where: { usuario: { id: usuarioId } },
          relations: ['clase', 'clase.perfilProfesor'], // Cargar la relación con la clase
        });

        // Mapear las inscripciones para devolver tanto la inscripción como la clase
        return inscripciones.map(inscripcion => ({
            id: inscripcion.id,
            fechaInscripcion: inscripcion.fechaInscripcion,
            fechaVencimiento: inscripcion.fechaVencimiento,
            estado: inscripcion.estado,
            clase: inscripcion.clase,

            }));
        }

    // async obtenerInscripcionesPorUsuario(usuarioId: string): Promise<InscripcionConClaseDto[]> {
    //     // Verificar si el usuario existe
    //     const usuario = await this.usuariosRepository.findOne({ where: { id: usuarioId } });
    //     if (!usuario) {
    //         throw new NotFoundException('Usuario no encontrado');
    //     }

    //     // Obtener las inscripciones del usuario
    //     const inscripciones = await this.inscripcionesRepository.find({
    //         where: { usuario: { id: usuarioId } },
    //         relations: ['clase'], // Asegúrate de que se incluyan las clases relacionadas
    //     });

    //     // Verificar si el usuario tiene inscripciones
    //     if (inscripciones.length === 0) {
    //         throw new NotFoundException('No se encontraron inscripciones para este usuario');
    //     }

    //     // Mapear las inscripciones a nuestro DTO de respuesta
    //     const inscripcionesDto = inscripciones.map((inscripcion) => ({
    //         id: inscripcion.id,
    //         fechaInscripcion: inscripcion.fechaInscripcion,
    //         fechaVencimiento: inscripcion.fechaVencimiento,
    //         estado: inscripcion.estado,
    //         clase: inscripcion.clase,  // Incluimos la clase relacionada
    //     }));

    //     return inscripcionesDto;
    // }
}
