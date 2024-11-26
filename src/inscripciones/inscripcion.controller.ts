import { Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { InscripcionesService } from "./inscripcion.service";
import { CrearInscripcionDto } from "./dtos/crear-inscripcion.dto";
import { UsuariosService } from "src/usuarios/usuario.service";
import { IsUUID } from "class-validator";
import { InscripcionRespuestaDto } from "./dtos/respuesta-inscripicon.dto";

@ApiTags("Inscripciones")
@Controller("inscripciones")
export class InscripcionController {
    constructor(
        private readonly inscripcionesService: InscripcionesService,
        private readonly usuariosService: UsuariosService,
    ) { }

    //*crear la Inscripcion
    @Post()
    @ApiOperation({ summary: 'Crear una nueva inscripcion' })
    @ApiResponse({ status: 201, description: 'Inscripcion creada con éxito' })
    @ApiResponse({ status: 400, description: 'Error en la creación de la inscripcion' })
    async crearInscripcion(@Body() crearInscripcionDto: CrearInscripcionDto) {
        try {
            const inscripcionNueva = await this.inscripcionesService.crearInscripcion(crearInscripcionDto)
            return inscripcionNueva;
        } catch (error) {
            throw new HttpException('Error al crear la inscripcion', HttpStatus.BAD_REQUEST);
        }
    }
    //* Actualizar el estado de la inscripción (de activa a inactiva)
    @Patch(':usuarioId/:claseId')
    @ApiOperation({ summary: 'Actualizar el estado de la inscripción por usuario y clase' })
    @ApiResponse({ status: 200, description: 'Estado de la inscripción actualizado con éxito' })
    @ApiResponse({ status: 404, description: 'Inscripción no encontrada' })
    @ApiResponse({ status: 400, description: 'Error al actualizar el estado de la inscripción' })
    async actualizarEstadoInscripcion(
        @Param('usuarioId') usuarioId: string,
        @Param('claseId') claseId: string,
    ): Promise<string> {
        try {
            // Llamamos al servicio para actualizar el estado sin necesidad de recibir el estado en el body
            const estadoActualizado = await this.inscripcionesService.actualizarEstadoInscripcion(
                usuarioId,
                claseId
            );
            return estadoActualizado;
        } catch (error) {
            throw new HttpException('Error al actualizar el estado de la inscripción', HttpStatus.BAD_REQUEST);
        }
    }
    //get de inscripciones de un usuario con las clases relacionadas
    @Get(":id")
    @ApiOperation({ summary: 'Obtener inscripciones de usuario por ID' })
    @ApiResponse({ status: 200, description: 'Inscripciones obtenidas', type: [InscripcionRespuestaDto] })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async inscripcionesDeUsuarioPorId(@Param("id", new ParseUUIDPipe()) id: string): Promise<InscripcionRespuestaDto[]> {
        const usuario = await this.usuariosService.obtenerUsuarioPorId(id)
        if (!IsUUID(4, { each: true })) {
            throw new HttpException('Invalid UUID', HttpStatus.BAD_REQUEST)
        }
        if (!usuario) {
            throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND)
        }
        //*Obtener las inscripciones
        const inscripciones = usuario.inscripciones;
        //manejemos los errores pues
        if (!inscripciones || inscripciones.length === 0) {
            throw new HttpException('No se encontraron inscripciones para este usuario', HttpStatus.NOT_FOUND);
          }
        //*Conversión al DTO de respuesta
        //*Lógica de manejo de errores
    }
    //get de inscripciones de una clase específica
    @Get()
    async inscripcionDeClasePorId() {

    }
    //get de inscripciones de clases según profesor
    @Get()
    async inscripcionesDeClasesPorProfesor() {

    }

}