import { Controller, Get, Post, Body, Param, UseGuards, Patch, HttpException, HttpStatus, Put, BadRequestException, Delete, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiBody, ApiConsumes } from "@nestjs/swagger";
import { AuthGuard } from "src/guard/auth.guard";
import { RolesGuard } from "src/guard/roles.guard";
import { Roles } from "src/decorators/roles.decorators";
import { CategoriesService } from "./categories.service";
import { CrearCategoriaDto } from "./dto/crear-categoria.dto";
import { RespuestaCategoriaDto } from "./dto/respuesta-categoria.dto";
import { ModificarCategoriaDto } from "./dto/modificar-categoria.dto";
import { Categoria } from "./categories.entity";
import { Clase } from "src/clases/clase.entity";
import { ModificarEstadoDto } from "./dto/modificar-estadoCategoria.dto";
import { FileUploadService } from "src/file-upload/file-upload.service";
import { FileInterceptor } from "@nestjs/platform-express";

@ApiTags('Categorias')
@Controller('categorias')


export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService,
        private readonly fileUploadService: FileUploadService,
        
    ) { }


    @Get()
    @ApiOperation({ summary: 'Listar todas las categorías' })
    @ApiResponse({ status: 200, description: 'Lista de categorías', type: [Categoria] })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiSecurity('bearer')
    async findAll(): Promise<Categoria[]> {
        return this.categoriesService.findAll();
    }

    @Get('activas')
    @ApiOperation({ summary: 'Listar todas las categorías activas' })
    @ApiResponse({ status: 200, description: 'Lista de categorías activas', type: [Categoria] })
    async findAllActivas(): Promise<Categoria[]> {
        return this.categoriesService.obtenerCategoriasActivas();
    }

    @Get(':id/activas')
    @ApiOperation({ summary: 'Obtener una categoría activa por ID' })
    @ApiResponse({ status: 200, description: 'Categoría encontrada', type: Categoria })
    @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
    async findOneActiva(@Param('id') id: string): Promise<Categoria> {
        return this.categoriesService.findOneActiva(id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una categoría por ID' })
    @ApiResponse({ status: 200, description: 'Categoría encontrada', type: Categoria })
    @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiSecurity('bearer')
    async findOne(@Param('id') id: string): Promise<Categoria> {
        return this.categoriesService.findOne(id);
    }

    @Get(':categoriaId/clases')
    @ApiOperation({ summary: 'Obtener clases por categoría' })
    @ApiResponse({ status: 200, description: 'Clases obtenidas', type: [Clase] })
    @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
    async findClasesByCategory(@Param('categoriaId') categoriaId: string) {
        return this.categoriesService.findClasesByCategory(categoriaId);
    }


    @Post()
    @ApiOperation({ summary: 'Crear una nueva categoría' })
    @ApiResponse({ status: 201, description: 'Categoría creada', type: RespuestaCategoriaDto })
    @ApiResponse({ status: 400, description: 'La categoría ya existe.' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiSecurity('bearer')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Datos para crear la categoria, incluyendo la opción de subir una imagen',
        schema: {
            type: 'object',
            properties: {
                imagen: { type: 'string', format: 'binary'},
                nombre: { type: 'string' },
            }
        }
    })
    @UseInterceptors(FileInterceptor('imagen'))
    async create(@Body() crearCategoriaDto: CrearCategoriaDto, @UploadedFile() file?: Express.Multer.File): Promise<RespuestaCategoriaDto> {
        const newCategory = await this.categoriesService.create(crearCategoriaDto, file);
        return newCategory;
    }

    @Put(':id')
    @ApiOperation({ summary: 'Modificar una categoría' })
    @ApiResponse({ status: 201, description: 'Categoría modificada', type: ModificarCategoriaDto })
    @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiSecurity('bearer')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Datos para actualizar la categoria, incluyendo la opción de subir una imagen',
        schema: {
            type: 'object',
            properties: {
                imagen: { type: 'string', format: 'binary'},
                nombre: { type: 'string' },
            }
        }
    })
    @UseInterceptors(FileInterceptor('imagen'))
    async update(
        @Param('id') id: string, 
        @Body() modificarCategoriaDto: ModificarCategoriaDto,
        @UploadedFile() file?: Express.Multer.File
    ): Promise<Categoria> {
        
        return this.categoriesService.update(id, modificarCategoriaDto, file);
    }

    @Patch(':id/estado')
    @ApiOperation({ summary: 'Modificar el estado de una categoria' })
    @ApiResponse({ status: 201, description: 'Estado de la categoria modificado exitosamente', type: [Categoria] })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 500, description: 'Error inesperado al modificar el estado de la categoria' })
    @ApiBody({ description: 'Cuerpo para modificar el estado de la categoria', type: ModificarEstadoDto })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiSecurity('bearer')
    async cambiarEstado(
        @Param('id') id: string,   
        @Body() modificarEstadoDto: ModificarEstadoDto, // El nuevo estado
    ) {
        return this.categoriesService.cambiarEstadoCategoria(id, modificarEstadoDto.estado);
    }



    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una categoria por ID' })
    @ApiResponse({ status: 204, description: 'Categoria eliminada exitosamente' })
    @ApiResponse({ status: 404, description: 'Categoria no encontrada' })
    async remove(@Param('id') id: string): Promise<{ message: string }> {
        const resultMessage = await this.categoriesService.removeCategory(id);
        return { message: resultMessage };
    }


}

