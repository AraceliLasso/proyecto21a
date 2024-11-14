import { Body, Controller, Delete, Get, HttpCode, HttpStatus, InternalServerErrorException, NotFoundException, Param, ParseUUIDPipe, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { ClasesService } from "./clase.service";
import { RespuestaClaseDto } from "./dto/respuesta-clase.dto";
import { CrearClaseDto } from "./dto/crear-clase.dto";
import { AuthGuard } from "src/guard/auth.guard";
import { RolesGuard } from "src/guard/roles.guard";
import { Roles } from "src/decorators/roles.decorators";
import { Clase } from "./clase.entity";
import { ModificarClaseDto } from "./dto/modificar-clase.dto";
import { SearchDto } from "./dto/search-logica.dto";

@ApiTags("Clases")
@Controller("clases")
export class ClasesController {
    constructor(
        private readonly clasesService: ClasesService,
    ) { }
    
    // POST
    @Post()
    @ApiOperation({ summary: 'Crear una nueva clase' })
    @ApiResponse({ status: 201, description: 'Clase creada exitosamente', type: RespuestaClaseDto })
    @ApiResponse({ status: 500, description: 'Error inesperado al crear la clase' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin', 'profesor')
    @ApiSecurity('bearer')
    async create(@Body() crearClaseDto: CrearClaseDto): Promise<RespuestaClaseDto> {
        try {
            return await this.clasesService.crear(crearClaseDto); // Nota: `crear` debe coincidir con el nombre correcto del método en el servicio.
        } catch (error) {
            console.error('Error al crear la clase:', error);
            throw new InternalServerErrorException('Error inesperado al crear la clase');
        }
    }
    @Post('search')
    @ApiOperation({ summary: 'Buscar clases por nombre, categoría, profesor o descripción' })
    @ApiResponse({ status: 200, description: 'Clases no encontradas', type: [Clase] })
    @ApiResponse({ status: 404, description: 'No se encontraron las clases' })
    async searchClases(@Body() searchDto: SearchDto) {
        try {
            const clases = await this.clasesService.searchClases(searchDto);
            if (!clases || clases.length === 0) {
                throw new NotFoundException('No se encontraron las clases');
            }
            return clases;
        } catch (error) {
            console.error('Error al buscar clases:', error);
            throw new InternalServerErrorException('Error inesperado al buscar clases');
        }
    }


    // GET --- ver si usamos el paginado o que traiga todas en una sola pagina
    @Get()
    @ApiOperation({ summary: 'Obtener todas las clases' })
    @ApiResponse({ status: 200, description: 'Clases obtenidas', type: [Clase] })
    @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: 'Cantidad de resultados por página', example: 5 })
    async getClases(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return this.clasesService.get(page, limit);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener clase por ID' })
    @ApiResponse({ status: 200, description: 'Clase obtenida', type: Clase })
    @ApiResponse({ status: 404, description: 'Clase no encontrada' })
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        const clase = await this.clasesService.findOne(id);
        if (!clase) {
            throw new NotFoundException("Clase no encontrada");
        }
        return clase;
    }
    
    // PUT
    @Put(":id")
    @ApiOperation({ summary: 'Actualizar una clase existente' })
    @ApiResponse({ status: 200, description: 'Clase actualizada exitosamente', type: RespuestaClaseDto })
    @ApiResponse({ status: 404, description: 'Clase no encontrada' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin', 'profesor')
    @ApiSecurity('bearer')
    async update(
        @Param("id") id: string,
        @Body() modificarClaseDto: ModificarClaseDto): Promise<RespuestaClaseDto> {
        try {
            const modificarClase = await this.clasesService.update(id, modificarClaseDto);
            if (!modificarClase) {
                throw new NotFoundException('Clase no encontrada');
            }
            return modificarClase;
        } catch (error) {
            console.error('Error al actualizar el clase:', error);
            throw new InternalServerErrorException('Error inesperado al actualizar la clase');
        }
    }

    // DELETE
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una clase por ID' })
    @ApiResponse({ status: 204, description: 'Clase eliminada exitosamente' })
    @ApiResponse({ status: 404, description: 'Clase no encontrada' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin', 'profesor')
    @ApiSecurity('bearer')
    async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ message: string }> {
        const resultMessage = await this.clasesService.remove(id);
        return { message: resultMessage };

}
}

