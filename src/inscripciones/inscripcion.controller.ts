import { Body, Controller, Delete, HttpException, HttpStatus, NotFoundException, Param, Patch, Post } from "@nestjs/common";
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

}