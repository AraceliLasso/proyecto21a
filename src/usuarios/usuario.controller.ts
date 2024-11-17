import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Put, Query, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { IsUUID } from "class-validator";
import { UsuariosService } from "./usuario.service";
import { CrearUsuarioDto } from "./dtos/crear-usuario.dto";
import { ActualizarUsuarioDto } from "./dtos/actualizar-usuario.dto";
import { MailService } from "src/notificaciones/mail.service";
import { LoginUsuarioDto } from "./dtos/login-usuario.dto";
import { UsuarioAdminDto } from "./dtos/admin-usuario.dto";
import UsuarioRespuestaDto from "./dtos/respuesta-usuario.dto";
import { Usuario } from "./usuario.entity";
import { Roles } from "src/decorators/roles.decorators";
import { AuthGuard } from "src/guard/auth.guard";
import { RolesGuard } from "src/guard/roles.guard";





@ApiTags("Usuarios")
@Controller("usuarios")
export class UsuariosController{
    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly mailService: MailService
    ) {}

    @Post('login')
    @ApiOperation({ summary: 'Loguear un usuario' })
    @ApiResponse({ status: 201, description: 'Usuario logueado exitosamente', type: LoginUsuarioDto })
    @ApiResponse({ status: 500, description: 'Error inesperado al loguear el usuario' })
    async signIn(@Body() credentials: LoginUsuarioDto){
        return this.usuariosService.login(credentials)
    }

    @Post('register')
    @ApiOperation({ summary: 'Crear un nuevo usuario' })
    @ApiResponse({ status: 201, description: 'Usuario creado exitosamente', type: CrearUsuarioDto })
    @ApiResponse({ status: 500, description: 'Error inesperado al crear el usuario' })
    async crearUsuario(@Body() crearUsuario: CrearUsuarioDto, @Req() request){
        const usuario = await this.usuariosService.crearUsuario(crearUsuario)

         //Enviar correo de confirmación
        await this.mailService.sendMail(
        crearUsuario.email,
        'Bienvenido a ForgeFit',
        'Gracias por registrarte.',
        '<h1>Te damos la bienvenida a ForgeFit!!</h1><p>Gracias por registrarte.</p>',
        );
        return {
            message: `Usuario creado exitosamente`,
            usuarioId: usuario.id
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
    @ApiResponse({ status: 200, description: 'Usuario obtenido', type: UsuarioRespuestaDto})
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiSecurity('bearer')
    @HttpCode(HttpStatus.OK)
    async obtenerUsuario(@Param('id', new ParseUUIDPipe()) id: string): Promise<UsuarioRespuestaDto>{
        const usuario = await this.usuariosService.obtenerUsuarioPorId(id)
        if(!IsUUID(4, { each: true})){
            throw new HttpException('Invalid UUID', HttpStatus.BAD_REQUEST)
        }
        if(!usuario){
            throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND)
        }
        return new UsuarioRespuestaDto(usuario)
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un usuario por ID' })
    @ApiResponse({ status: 200, description: 'Usuario actualizado', type: ActualizarUsuarioDto })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    @HttpCode(HttpStatus.OK)
    async actualizarUsuarios(@Param('id') id: string, @Body() actualizarUsuarios: ActualizarUsuarioDto): Promise<Usuario>{
        const usuario = await this.usuariosService.actualizarUsuarios(id, actualizarUsuarios) 
        return usuario;
    }


    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un usuario por ID' })
    @ApiResponse({ status: 204, description: 'Usuario eliminado exitosamente' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiSecurity('bearer')
    @HttpCode(HttpStatus.OK)
    async eliminarUsuarios(@Param('id') id: string): Promise<{id: string}>{
        const resultado = await this.usuariosService.eliminarUsuarios(id)
        if(!resultado){
            throw new NotFoundException(`Usuario con ${id} no fue encontrado`);
        }

        return {id}
    }

}