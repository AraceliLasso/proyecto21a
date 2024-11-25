import { Controller, Get, Post, Body, Param, UseGuards, Patch, HttpException, HttpStatus, Put, BadRequestException, Delete } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from "@nestjs/swagger";
import { AuthGuard } from "src/guard/auth.guard";
import { RolesGuard } from "src/guard/roles.guard";
import { Roles } from "src/decorators/roles.decorators";
import { CategoriesService } from "./categories.service";
import { CrearCategoriaDto } from "./dto/crear-categoria.dto";
import { RespuestaCategoriaDto } from "./dto/respuesta-categoria.dto";
import { ModificarCategoriaDto } from "./dto/modificar-categoria.dto";
import { Categoria } from "./categories.entity";
import { Clase } from "src/clases/clase.entity";

@ApiTags('Categorias')
@Controller('categorias')


export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }


    @Get()
    @ApiOperation({ summary: 'Listar todas las categorías' })
    @ApiResponse({ status: 200, description: 'Lista de categorías', type: [Categoria] })
    async findAll(): Promise<Categoria[]> {
        return this.categoriesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una categoría por ID' })
    @ApiResponse({ status: 200, description: 'Categoría encontrada', type: Categoria })
    @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
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
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('admin')
    // @ApiSecurity('bearer')
    async create(@Body() crearCategoriaDto: CrearCategoriaDto): Promise<RespuestaCategoriaDto> {
        const newCategory = await this.categoriesService.create(crearCategoriaDto);
        return new RespuestaCategoriaDto(newCategory.id, newCategory.nombre);
    }

    @Put(':id')
    async update(
        @Param('id') id: string, 
        @Body() modificarCategoriaDto: ModificarCategoriaDto
    ): Promise<Categoria> {
        try {
        return await this.categoriesService.update(id, modificarCategoriaDto);
        } catch (error) {
        throw new BadRequestException('Error al actualizar la categoría: ' + error.message);
        }
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

