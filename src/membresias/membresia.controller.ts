// membresia.controller.ts
import { Controller, Post, Body, Param, Put, Get, UseGuards, Req, NotFoundException, HttpStatus, HttpCode, Query } from '@nestjs/common';
import { MembresiaService } from './membresia.service';
import { Membresia } from './membresia.entity';
import { Usuario } from 'src/usuarios/usuario.entity';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorators/roles.decorators';
import { AuthGuard } from 'src/guard/auth.guard';
import { UsuariosService } from 'src/usuarios/usuario.service';
import { MembresiaInactivaDto } from './dtos/inactivo-membresia.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from '@nestjs/swagger';

@Controller('membresias')
export class MembresiaController {
    constructor(
        private readonly membresiaService: MembresiaService,
        private readonly usuariosService: UsuariosService
    ) { }

    //*para que este endpoint funcione, necesito:Para que esto funcione correctamente, debes asegurarte de que el objeto req.user
    //*contenga el usuario autenticado.
    //*Esto generalmente se logra con un guard de autenticación que coloca el usuario en req.user después de verificar el token JWT.
    // @Post()
    // async crearMembresia(@Body() crearMembresiaDto: CrearMembresiaDto, @Request() req) {
    //     // Obtén el usuario de la solicitud
    //     const usuario = req.user;

    //     // Llama al servicio pasando el usuario y los otros parámetros
    //     return this.membresiaService.comprarMembresia(
    //         usuario,
    //         crearMembresiaDto.nombre,
    //         crearMembresiaDto.precio,
    //         crearMembresiaDto.duracionEnMeses
    //     );
    // }


    // Obtener historial de membresías: GET /membresias/historial
    //*para que el usuario vea sus propias membresias
    @Get(':usuarioId/historial')
    async obtenerHistorialMembresias(
        @Param('usuarioId') usuarioId: string
    ): Promise<Membresia[]> {
        const usuario = new Usuario();
        usuario.id = usuarioId;
        return this.membresiaService.obtenerHistorialMembresias(usuario);
    }
   
    @Get('admin/historial')
     @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin') // Asegura que solo los administradores tengan acceso
    async obtenerHistorialMembresiasAdmin(): Promise<Membresia[]> {
        return this.membresiaService.obtenerHistorialMembresiasAdmin();
    }
    // Obtener membresía activa: GET /membresias/activa

    @Get(":id/activa")
    @UseGuards(AuthGuard)
    async obtenerMembresiaActiva(@Param('id') id: string): Promise<Membresia> {
        const usuario = await this.usuariosService.obtenerUsuarioPorId(id); // Ajusta según tu lógica para obtener el usuario

        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        return this.membresiaService.obtenerMembresiaActiva(usuario);
    }
    // Obtener membresías inactivas: GET /membresias/inactivas

    @Get('pag/inactivas')
    @ApiOperation({ summary: 'Obtener todas las membresías inactivas' })
    @ApiResponse({ status: 200, description: 'Membresías inactivas obtenidas', type: [MembresiaInactivaDto] })
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiSecurity('bearer')
    @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: 'Cantidad de resultados por página', example: 5 })
    async obtenerMembresiasInactivas(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 5,
    ): Promise<MembresiaInactivaDto[]> {
      const membresias = await this.membresiaService.obtenerMembresiasInactivas(page, limit);
  
      return membresias.map(membresia => ({
        id: membresia.id,
        usuarioNombre: membresia.usuario?.nombre || 'Desconocido', // Aseguramos que no sea null
        fechaExpiracion: membresia.fechaExpiracion,
        activo: membresia.activo,
      }));
    }

    @Put('desactivar/:nombre')
    async desactivarMembresia(@Param('nombre') nombre: string) {
        return this.membresiaService.desactivarMembresia(nombre);
    }
}
// Actualizar precio de membresía: PATCH /membresias/precio

// Cancelar membresía (usuario): DELETE /membresias/cancelar
// Cancelar membresía (admin): DELETE /membresias/cancelar/:id
// renovarMembresia: Método: PATCH o PUT /membresias/renovar





//GET
//POST
//PUT
//DELETE