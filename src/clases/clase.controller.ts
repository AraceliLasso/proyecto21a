import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, InternalServerErrorException, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { ClasesService } from "./clase.service";
import { RespuestaClaseDto } from "./dto/respuesta-clase.dto";
import { CrearClaseDto } from "./dto/crear-clase.dto";
import { AuthGuard } from "src/guard/auth.guard";
import { RolesGuard } from "src/guard/roles.guard";
import { Roles } from "src/decorators/roles.decorators";
import { Clase } from "./clase.entity";
import { ModificarClaseDto } from "./dto/modificar-clase.dto";
import { SearchDto } from "./dto/search-logica.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileUploadService } from "src/file-upload/file-upload.service";
import { ImageUploadPipe } from "src/pipes/pipes/image/image-upload.pipe";
import { TransformInterceptor } from "./interceptor";
import { ModificarEstadoDto } from "./dto/modificar-estadoClase.dto";

@ApiTags("Clases")
@Controller("clases")
export class ClasesController {
    constructor(
        private readonly clasesService: ClasesService,
        private readonly fileUploadService: FileUploadService
    ) { }
    
    // POST
    @Post()
    @ApiOperation({ summary: 'Crear una nueva clase' })
    @ApiResponse({ status: 201, description: 'Clase creada exitosamente', type: RespuestaClaseDto })
    @ApiResponse({ status: 400, description: 'La clase ya existe.' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin', 'profesor')
    @ApiSecurity('bearer')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Datos para actualizar la clase, incluyendo la opción de subir una imagen',
        schema: {
            type: 'object',
            properties: {
                imagen: { type: 'string', format: 'binary'},
                nombre: { type: 'string' },
                descripcion: { type: 'string' },
                fecha: {type: 'date'},
                disponibilidad: {type: 'number'},
                categoriaId: {type: 'string'},
                perfilProfesorId: {type: 'string'}

            },
        },
    })
    @UseInterceptors(FileInterceptor('imagen', { limits: { fileSize: 10 * 1024 * 1024} }), TransformInterceptor)
    async create(@Body() crearClaseDto: CrearClaseDto, @UploadedFile() file?: Express.Multer.File): Promise<RespuestaClaseDto> {
        
            // Validación de disponibilidad
            if (typeof crearClaseDto.disponibilidad !== 'number') {
                throw new BadRequestException('Disponibilidad debe ser un número');
            }
            console.log('Tipo:', typeof crearClaseDto.disponibilidad); // Ahora debería ser "number"
            console.log('Valor:', crearClaseDto.disponibilidad); // Ahora debería ser un número válido

            // Crea la clase en la base de datos sin la imagen
            const nuevaClase = await this.clasesService.crear(crearClaseDto, file);
            return nuevaClase; 
        
    }

    //Para habilitar o deshabilitar una clase
    @Patch(':id')
    @ApiOperation({ summary: 'Modificar el estado de una clase' })
    @ApiResponse({ status: 201, description: 'Estado de la clase modificado exitosamente', type: [Clase] })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 500, description: 'Error inesperado al modificar el estado de la clase' })
    @ApiBody({ description: 'Cuerpo para modificar el estado de una clase', type: ModificarEstadoDto })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiSecurity('bearer')
    async modificarEstadoClase(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() modificarEstadoDto: ModificarEstadoDto
    ): Promise<Clase> {
    return this.clasesService.modificarEstado(id, modificarEstadoDto.estado);
    }

    //Obtenemos solo las clases activas
    @ApiOperation({ summary: 'Obtener todas las clases activas' })
    @ApiResponse({ status: 201, description: 'Clases activas obtenidas', type: [Clase] })
    @ApiResponse({ status: 500, description: 'No se encontraron clases activas' })
    @Get('/activas')
    async getClasesActivas(): Promise<Clase[]> {
    return this.clasesService.filtrarClasesActivas();
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


    // GET --- Solo el admin puede ver todas las clases, tanto activas como no
    @Get()
    @ApiOperation({ summary: 'Obtener todas las clases' })
    @ApiResponse({ status: 200, description: 'Clases obtenidas', type: [Clase] })
    @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: 'Cantidad de resultados por página', example: 5 })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiSecurity('bearer')
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
    @ApiResponse({ status: 400, description: 'La clase ya existe.' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin', 'profesor')
    @ApiSecurity('bearer')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Datos para actualizar la clase, incluyendo la opción de subir una imagen',
        schema: {
            type: 'object',
            properties: {
                imagen: {
                    type: 'string',
                    format: 'binary'
                },
                nombre: { type: 'string' },
                descripcion: { type: 'string' },
                fecha: {type: 'date'},
                disponibilidad: {type: 'number'},
                categoriaId: {type: 'string'},
                perfilProfesorId: {type: 'string'}

            },
        },
    })
    @UseInterceptors(FileInterceptor('imagen'))
    async update(
        @Param("id") id: string,
        @Body() modificarClaseDto: ModificarClaseDto, @UploadedFile(new ImageUploadPipe()) file?: Express.Multer.File): Promise<RespuestaClaseDto> {
        
            // Si hay un archivo, súbelo a Cloudinary
        if (file) {
            const uploadResult = await this.fileUploadService.uploadFile(file, 'clase', id);
            modificarClaseDto.imagen = uploadResult.imgUrl; // Asigna la URL de la imagen al DTO
        }

            const modificarClase = await this.clasesService.update(id, modificarClaseDto);
            if (!modificarClase) {
                throw new NotFoundException('Clase no encontrada');
            }
            return modificarClase;
    
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

