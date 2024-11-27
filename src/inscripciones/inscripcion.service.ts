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

@Injectable()
export class InscripcionesService {
    constructor(
        @InjectRepository(Inscripcion)
        private readonly inscripcionesRepository: Repository<Inscripcion>,
        @InjectRepository(Usuario)
        private readonly usuariosRepository: Repository<Usuario>,
        @InjectRepository(Clase)
        private readonly clasesRepository: Repository<Clase>,
        @InjectRepository(Membresia)
        private readonly membresiaRepository: Repository<Membresia>,
        @InjectRepository(Categoria)
        private readonly categoriaRepository: Repository<Categoria>,
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
}
