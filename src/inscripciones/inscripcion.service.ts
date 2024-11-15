import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { Inscripcion } from "./inscripcion.entity";
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
    async eliminarInscripcion(usuarioId: string, claseId: string): Promise<string> {

        // Verificar la existencia de la inscripción
        //* Aseguramos que las relaciones estén cargadas
        const verificarInscripcion = await this.inscripcionesRepository.findOne({ where: { usuario: { id: usuarioId }, clase: { id: claseId } }, relations: ["usuario", "clase"] })
        if (!verificarInscripcion) { throw new NotFoundException("No se encontró la inscripción del usuario en esta clase.") }
        // Verificar que el usuario tenga una membresía activa
        const membresiaActiva = await this.membresiaService.obtenerMembresiaActivaPorUsuario(usuarioId);
        if (!membresiaActiva) {
            throw new BadRequestException("El usuario no tiene mebresia activa.El usuario no tiene una membresía activa. No se puede gestionar la inscripción.")
        }
        // Eliminar la inscripción
        await this.inscripcionesRepository.remove(verificarInscripcion);
        return "Inscripcione eliminada exitosamente"
    }
}