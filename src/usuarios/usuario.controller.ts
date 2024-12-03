import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, InternalServerErrorException, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Put, Query, Req, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { IsUUID } from "class-validator";
import { UsuariosService } from "./usuario.service";
import { CrearUsuarioDto } from "./dtos/crear-usuario.dto";
import { ActualizarUsuarioDto } from "./dtos/actualizar-usuario.dto";
import { MailService } from "src/notificaciones/mail.service";
import { LoginUsuarioDto } from "./dtos/login-usuario.dto";
import { UsuarioAdminDto } from "./dtos/admin-usuario.dto";
import UsuarioRespuestaDto from "./dtos/respuesta-usuario.dto";
import { rolEnum, Usuario } from "./usuario.entity";
import { Roles } from "src/decorators/roles.decorators";
import { AuthGuard } from "src/guard/auth.guard";
import { RolesGuard } from "src/guard/roles.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { FileUploadService } from "src/file-upload/file-upload.service";
import { ModificarEstadoDto } from "./dtos/modificar-estadoUsuario.dto";
import { ModificarRolDto } from "./dtos/modificar-rolUsuario.dto";
import { ClasesService } from "src/clases/clase.service";





@ApiTags("Usuarios")
@Controller("usuarios")
export class UsuariosController {
    constructor(
        private readonly usuariosService: UsuariosService,
        // private readonly mailService: MailService,
        private readonly fileUploadService: FileUploadService,
        private readonly clasesService: ClasesService,
    ) { }

    @Post('login')
    @ApiOperation({ summary: 'Loguear un usuario' })
    @ApiResponse({ status: 201, description: 'Usuario logueado exitosamente', type: LoginUsuarioDto })
    @ApiResponse({ status: 500, description: 'Error inesperado al loguear el usuario' })
    async signIn(@Body() credentials: LoginUsuarioDto) {
        return this.usuariosService.login(credentials)
    }

    @Post('register')
    @ApiOperation({ summary: 'Crear un nuevo usuario' })
    @ApiResponse({ status: 201, description: 'Usuario creado exitosamente', type: CrearUsuarioDto })
    @ApiResponse({ status: 500, description: 'Error inesperado al crear el usuario' })
    @UseInterceptors(FileInterceptor('imagen'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Datos para registrar el usuario, incluyendo la opción de subir una imagen',
        schema: {
            type: 'object',
            properties: {
                nombre: { type: 'string' },
                email: { type: 'string' },
                contrasena: { type: 'string' },
                confirmarContrasena: { type: 'string' },
                edad: { type: 'number' },
                telefono: { type: 'number' },
                imagen: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    async crearUsuario(@Body() crearUsuario: CrearUsuarioDto, @UploadedFile() imagen: Express.Multer.File, @Req() request) {
        const usuario = await this.usuariosService.crearUsuario(crearUsuario, imagen)

        //Enviar correo de confirmación
        // await this.mailService.sendMail(
        // crearUsuario.email,
        // 'Bienvenido a ForgeFit',
        // 'Gracias por registrarte.',
        // '<h1>Te damos la bienvenida a ForgeFit!!</h1><p>Gracias por registrarte.</p>',
        // );
        return {
            message: `Usuario creado exitosamente`,
            usuario
        };
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los usuarios' })
    @ApiResponse({ status: 200, description: 'Usuarios obtenidos', type: [UsuarioAdminDto] })
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiSecurity('bearer')
    @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: 'Cantidad de resultados por página', example: 5 })
    async obtenerUsuariosPag(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 5
    ): Promise<UsuarioAdminDto[]> {
        console.log('llamar obtenerUsuariosPag');
        return this.usuariosService.obtenerUsuariosPag(page, limit);

    }





    @Get(':id')
    @ApiOperation({ summary: 'Obtener usuario por ID' })
    @ApiResponse({ status: 200, description: 'Usuario obtenido', type: UsuarioRespuestaDto })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('admin')
    // @ApiSecurity('bearer')
    @HttpCode(HttpStatus.OK)
    async obtenerUsuario(@Param('id', new ParseUUIDPipe()) id: string): Promise<UsuarioRespuestaDto> {
        const usuario = await this.usuariosService.obtenerUsuarioPorId(id)
        if (!IsUUID(4, { each: true })) {
            throw new HttpException('Invalid UUID', HttpStatus.BAD_REQUEST)
        }
        if (!usuario) {
            throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND)
        }
        return new UsuarioRespuestaDto(usuario)
    }

    //get de TODAS las inscripciones de TODAS las clases de un ID profesor 
    @Get('profesor/:id/inscripciones')
    async obtenerInscripcionesPorProfesor(
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.clasesService.obtenerInscripcionesPorProfesor(id);
    }


    @Put(':id')
    @UseInterceptors(FileInterceptor('imagen'))
    @ApiOperation({ summary: 'Actualizar un usuario por ID' })
    @ApiResponse({ status: 200, description: 'Usuario actualizado', type: ActualizarUsuarioDto })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    @HttpCode(HttpStatus.OK)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Datos para actualizar el usuario, incluyendo la opción de subir una imagen',
        schema: {
            type: 'object',
            properties: {
                nombre: { type: 'string' },
                edad: { type: 'number' },
                telefono: { type: 'number' },
                email: { type: 'string' },
                contrasena: { type: 'string' },
                imagen: {
                    type: 'string',
                    format: 'binary'
                },

            },
        },
    })
    async actualizarUsuarios(@Param('id') id: string, @Body() actualizarUsuarios: ActualizarUsuarioDto, @UploadedFile() imagen: Express.Multer.File): Promise<Usuario> {
        try {
            if (imagen) {
                const uploadResult = await this.fileUploadService.uploadFile(imagen, 'usuario', id);
                actualizarUsuarios.imagen = uploadResult.imgUrl; // Asigna la URL de la imagen al DTO
            }
            const usuario = await this.usuariosService.actualizarUsuarios(id, actualizarUsuarios)
            if (!usuario) {
                throw new NotFoundException('Usuario no encontrado');
            }
            return usuario;
        } catch (error) {
            console.error('Error al actualizar el usuario:', error);
            throw new InternalServerErrorException('Error inesperado al actualizar el usuario');
        }
    }

    @Put(":id/rol")
    @UseGuards(RolesGuard)
    @Roles(rolEnum.ADMIN) // Solo el administrador puede cambiar roles
    @ApiOperation({ summary: "Modificar el rol de un usuario" })
    @ApiParam({ name: "id", description: "ID del usuario a modificar" })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiSecurity('bearer')
    async modificarRol(@Param("id") id: string, @Body() modificarRolDto: ModificarRolDto): Promise<Usuario> {
        return await this.usuariosService.modificarRol(id, modificarRolDto);
    }


    //Para habilitar o deshabilitar un usuario
    @Patch(':id')
    @ApiOperation({ summary: 'Modificar el estado de un usuario' })
    @ApiResponse({ status: 201, description: 'Estado del usuario modificado exitosamente', type: [Usuario] })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 500, description: 'Error inesperado al modificar el estado del usuario' })
    @ApiBody({ description: 'Cuerpo para modificar el estado de una clase', type: ModificarEstadoDto })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiSecurity('bearer')
    async modificarEstadoUsuario(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() modificarEstadoDto: ModificarEstadoDto
    ): Promise<Usuario> {
    return this.usuariosService.modificarEstadoUsuario(id, modificarEstadoDto.estado);
    }




    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un usuario por ID' })
    @ApiResponse({ status: 204, description: 'Usuario eliminado exitosamente' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiSecurity('bearer')
    @HttpCode(HttpStatus.OK)
    async eliminarUsuarios(@Param('id') id: string): Promise<{ id: string }> {
        const resultado = await this.usuariosService.eliminarUsuarios(id)
        if (!resultado) {
            throw new NotFoundException(`Usuario con ${id} no fue encontrado`);
        }

        return { id }
    }

}