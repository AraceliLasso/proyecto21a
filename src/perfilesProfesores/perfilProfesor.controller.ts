import { BadRequestException, Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { PerfilesProfesoresService } from "./perfilProfesor.service";
import { RespuestaPerfilProfesorDto } from "./dto/respuesta-perfilProfesor.dto";
import { AuthGuard } from "src/guard/auth.guard";
import { RolesGuard } from "src/guard/roles.guard";
import { Roles } from "src/decorators/roles.decorators";
import { CrearPerfilProfesorDto } from "./dto/crear-perfilProfesor.dto";
import { PerfilProfesor } from "./perfilProfesor.entity";
import { Clase } from "src/clases/clase.entity";
import { ModificarPerfilProfesorDto } from "./dto/modificar-perfilProfesor.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileUploadService } from "src/file-upload/file-upload.service";
import { ModificarEstadoDto } from "./dto/modificar-estadoPerfilProfesor.dto";
import { SearchPerfilProfesorDto } from "./dto/search-perfilProfesor-dto";


@ApiTags("PerfilProfesor")
@Controller("perfilProfesor")
export class PerfilesProfesoresController{
    constructor(
        private readonly perfilesProfesoresService: PerfilesProfesoresService,
        private readonly fileUploadService: FileUploadService
    ){}

    @Post(':usuarioId')
    @ApiOperation({ summary: 'Crear un perfil de profesor' })
    @ApiResponse({ status: 201, description: 'Perfil de profesor creado', type: RespuestaPerfilProfesorDto })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin' , 'profesor')
    @ApiSecurity('bearer')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('imagen'))
    async crearPerfilProfesor(@Param('usuarioId') usuarioId: string, // ID del usuario asociado
    @Body()  crearPerfilProfesorDto: CrearPerfilProfesorDto,
    @UploadedFile() imagen?: Express.Multer.File
): Promise<RespuestaPerfilProfesorDto> {
        const perfil = await this.perfilesProfesoresService.crearPerfilProfesor(usuarioId, crearPerfilProfesorDto, imagen);
        return perfil;
    }
    @Post('search')
    @ApiOperation({ summary: 'Buscar perfiles de profesores por palabras clave' })
    @ApiResponse({ status: 200, description: 'Perfiles encontrados', type: [PerfilProfesor] })
    async search(@Body() searchDto: SearchPerfilProfesorDto): Promise<PerfilProfesor[]> {
        return this.perfilesProfesoresService.search(searchDto);
    }



    @Get()
    @ApiOperation({ summary: 'Listar todos los perfiles de profesores' })
    @ApiResponse({ status: 200, description: 'Lista de perfiles de profesores', type: [PerfilProfesor] })
    async encontrarTodos(): Promise<PerfilProfesor[]> {
        return this.perfilesProfesoresService.obtenerPerfilProfesor();
    }

    @Get('clase')
    @ApiOperation({ summary: 'Listar todos los perfiles de profesores por clases asignadas' })
    @ApiResponse({ status: 200, description: 'Lista de perfiles de profesores con sus clases asignadas', type: [PerfilProfesor] })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin' , 'profesor')
    @ApiSecurity('bearer')
    async encontrarTodosPorClase(): Promise<PerfilProfesor[]> {
        return this.perfilesProfesoresService.obtenerPerfilProfesorClase();
    }

    @Get('perfilProfesorActivos/clase')
    @ApiOperation({ summary: 'Listar todos los perfiles de profesores activos por clases asignadas' })
    @ApiResponse({ status: 200, description: 'Lista de perfiles de profesores activos con sus clases asignadas', type: [PerfilProfesor] })
    async encontrarTodosActivosPorClase(): Promise<PerfilProfesor[]> {
        return this.perfilesProfesoresService.obtenerPerfilProfesorActivoClase();
    }


    @Get(':usuarioId')
    @ApiOperation({ summary: 'Obtener un perfil por UsuarioID' })
    @ApiResponse({ status: 200, description: 'Perfil de profesor encontrado', type: PerfilProfesor })
    @ApiResponse({ status: 404, description: 'Perfil de profesor no encontrado' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin' , 'profesor')
    @ApiSecurity('bearer')
    async findOne(@Param('usuarioId',  ParseUUIDPipe)usuarioId: string): Promise<PerfilProfesor> {
        return this.perfilesProfesoresService.obtenerPerfilProfesorPorUsuarioId(usuarioId);
    }



    @Get(':perfilProfesorId/clases')
    @ApiOperation({ summary: 'Obtener los perfiles de profesores por clase' })
    @ApiResponse({ status: 200, description: 'Perfiles obtenidos', type: [Clase] })
    @ApiResponse({ status: 404, description: 'Perfil de profesor no encontrado' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin' , 'profesor')
    @ApiSecurity('bearer')
    async findPerfilByClases(@Param('perfilProfesorId') perfilProfesorId: string) {
        return this.perfilesProfesoresService.obtenerPerfilProfesorIdYClase(perfilProfesorId);
    }

    @Get(':perfilProfesorId/activas')
    @ApiOperation({ summary: 'Obtener los perfiles de profesores por clase activas' })
    @ApiResponse({ status: 200, description: 'Perfiles obtenidos', type: [Clase] })
    @ApiResponse({ status: 404, description: 'Perfil de profesor no encontrado' })
    async findPerfilByClasesActivas(@Param('perfilProfesorId') perfilProfesorId: string) {
        return this.perfilesProfesoresService.obtenerPerfilProfesorConClasesActivas(perfilProfesorId);
    }


    @Put(':id')
    @ApiOperation({ summary: 'Modificar los perfiles de profesores' })
    @ApiResponse({ status: 200, description: 'Perfil actualizado correctamente', type: [Clase] })
    @ApiResponse({ status: 404, description: 'Perfil de profesor no encontrado' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin' , 'profesor')
    @ApiSecurity('bearer')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('imagen'))
    async update(
        @Param('id') id: string, 
        @Body() modificarPerfilProfesorDto: ModificarPerfilProfesorDto,
        @UploadedFile() imagen?: Express.Multer.File 
    ): Promise<PerfilProfesor> {
        try {
            let imgUrl: string | undefined;

        // Si se sube una nueva imagen, súbela a Cloudinary
        if (imagen) {
            const uploadResult = await this.fileUploadService.uploadFile(imagen, 'perfilProfesor', id);
            imgUrl = uploadResult.imgUrl; // Extrae la URL de la imagen del resultado
        }

        return await this.perfilesProfesoresService.modificarPerfilProfesor(id, {
            ...modificarPerfilProfesorDto,
            ...(imgUrl && { imagen: imgUrl }) // Solo agrega la URL de la imagen si existe
        });
        } catch (error) {
        throw new BadRequestException('Error al actualizar el perfil del profesor: ' + error.message);
        }
    }


    @Patch(':id/estado')
    @ApiOperation({ summary: 'Modificar el estado de un perfil profesor' })
    @ApiResponse({ status: 201, description: 'Estado del perfil profesor modificado exitosamente', type: [PerfilProfesor] })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 500, description: 'Error inesperado al modificar el estado del perfil profesor' })
    @ApiBody({ description: 'Cuerpo para modificar el estado del perfil profesor', type: ModificarEstadoDto })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiSecurity('bearer')
    async cambiarEstado(
        @Param('id') id: string,   // ID del profesor
        @Body() modificarEstadoDto: ModificarEstadoDto, // El nuevo estado
    ) {
        return this.perfilesProfesoresService.cambiarEstadoPerfilProfesor(id, modificarEstadoDto.estado);
    }


    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un perfil de profesor por ID' })
    @ApiResponse({ status: 204, description: 'Perfil de profesor eliminado exitosamente' })
    @ApiResponse({ status: 404, description: 'Perfil de profesor no encontrado' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin' , 'profesor')
    @ApiSecurity('bearer')
    async remove(@Param('id') id: string): Promise<{ message: string }> {
        const resultMessage = await this.perfilesProfesoresService.eliminarPerfilProfesor(id);
        return { message: resultMessage };
    }


}

