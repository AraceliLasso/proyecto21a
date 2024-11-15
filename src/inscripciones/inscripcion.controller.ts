import { Body, Controller, Delete, HttpException, HttpStatus, NotFoundException, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { InscripcionesService } from "./inscripcion.service";
import { CrearInscripcionDto } from "./dtos/crear-inscripcion.dto";

@ApiTags("Inscripciones")
@Controller("inscripciones")
export class InscripcionController {
    constructor(
        private readonly inscripcionesService: InscripcionesService,
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
    //*Eliminar la inscripcion
    @Delete(':usuarioId/:claseId')
    @ApiOperation({ summary: 'Eliminar una inscripción por usuario y clase' })
    @ApiResponse({ status: 204, description: 'Inscripción eliminada exitosamente' })
    @ApiResponse({ status: 404, description: 'Inscripción no encontrada' })
    async eliminarInscripcion(
        @Param('usuarioId') usuarioId: string,
        @Param('claseId') claseId: string,
    ): Promise<void> {
        const resultado = await this.inscripcionesService.eliminarInscripcion(usuarioId, claseId);

        if (!resultado) {
            throw new NotFoundException(`No se encontró la inscripción del usuario con ID ${usuarioId} en la clase con ID ${claseId}.`);
        }

        return; // HTTP 204 No Content
    }

}