import { BadRequestException, Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { InscripcionesService } from "./inscripcion.service";
import { CrearInscripcionDto } from "./dtos/crear-inscripcion.dto";
import { UsuariosService } from "src/usuarios/usuario.service";
import { IsUUID } from "class-validator";
import { InscripcionRespuestaDto } from "./dtos/respuesta-inscripicon.dto";
import { EstadoInscripcion } from "./inscripcion.entity";
import { InscripcionConClaseDto } from "./dtos/conClase-inscripcion.dto";

@ApiTags("Inscripciones")
@Controller("inscripciones")
export class InscripcionController {
    constructor(
        private readonly inscripcionesService: InscripcionesService,
        private readonly usuariosService: UsuariosService,
    ) { }

    //*crear la Inscripcion
    @Post()
    @ApiOperation({ summary: 'Crear una nueva inscripción' })
    @ApiResponse({ status: 201, description: 'Inscripción creada con éxito' })
    @ApiResponse({ status: 400, description: 'Datos inválidos o error al crear la inscripción' })
    @ApiResponse({ status: 404, description: 'Usuario o clase no encontrados' })
    async crearInscripcion(@Body() crearInscripcionDto: CrearInscripcionDto) {
        try {
            const inscripcionNueva = await this.inscripcionesService.crearInscripcion(crearInscripcionDto);
            return {
                message: 'Inscripción creada con éxito',
                inscripcion: inscripcionNueva,
            };
        } catch (error) {
            // Manejo de errores
            if (error instanceof NotFoundException) {
                throw new HttpException(error.message, HttpStatus.NOT_FOUND);
            }
            throw new HttpException('Error al crear la inscripción: ' + error.message, HttpStatus.BAD_REQUEST);
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
        //*get de inscripciones de un usuario con las clases relacionadas
    @Get('usuario/:usuarioId')
    @ApiOperation({ summary: 'Obtener las inscripciones de un usuario por ID' })
    @ApiResponse({ status: 200, description: 'Lista de inscripciones encontradas', type: [InscripcionConClaseDto] })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado o no tiene inscripciones' })
    async obtenerInscripcionesPorUsuarioId(@Param('usuarioId') usuarioId: string) {
        const inscripcionesConClase = await this.inscripcionesService.obtenerInscripcionesConClase(usuarioId);
        return inscripcionesConClase;
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