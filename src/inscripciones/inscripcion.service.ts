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
    async crearInscripcion(crearInscripcon: CrearInscripcionDto): Promise<Inscripcion> {
        const { usuarioId, claseId } = crearInscripcon
        // verificando existencia de usuario y clase
        const verificarUsuario = await this.usuariosRepository.findOne({ where: { id: usuarioId } });
        if (!verificarUsuario) { throw new NotFoundException("Usuario no encontrado") }

        const verificarClase = await this.clasesRepository.findOne({ where: { id: claseId } });
        if (!verificarClase) { throw new NotFoundException("Clase no encontrada") }
        // verificar que el usuario tenga una membresia activa
        const membresiaActiva = await this.membresiaService.obtenerMembresiaActivaPorUsuario(usuarioId);
        if (!membresiaActiva) {
            throw new BadRequestException("El usuario no tiene mebresia activa")
        }
        //* Crear la inscripcion
        const inscripcion = this.inscripcionesRepository.create({
            usuario: verificarUsuario,
            clase: verificarClase
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
}