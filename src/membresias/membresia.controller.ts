// membresia.controller.ts
import { Controller, Post, Body, Param, Put, Get, UseGuards, Req, NotFoundException, HttpStatus, HttpCode, Query, Patch, ForbiddenException, Request, Delete, HttpException } from '@nestjs/common';
import { MembresiaService } from './membresia.service';
import { Membresia } from './membresia.entity';
import { rolEnum, Usuario } from 'src/usuarios/usuario.entity';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorators/roles.decorators';
import { AuthGuard } from 'src/guard/auth.guard';
import { UsuariosService } from 'src/usuarios/usuario.service';
import { MembresiaInactivaDto } from './dtos/inactivo-membresia.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ActualizarPrecioMembresiaDto } from './dtos/actualizar-membresia.dto';
import * as express from 'express';
import { CrearMembresiaDto } from './dtos/crear-membresia.dto';
import { StripeService } from 'src/stripe/stripe.service';
@ApiTags("Membresias")
@Controller('membresias')
export class MembresiaController {
    constructor(
        private readonly membresiaService: MembresiaService,
        private readonly usuariosService: UsuariosService,
        private readonly stripeService: StripeService,

    ) { }
    //*endpoint para crear membresias como admin
    @Post()
    @ApiOperation({ summary: 'Crear una nueva membresía (solo admin)' })
    @ApiResponse({ status: 201, description: 'Membresía creada con éxito' })
    @ApiResponse({ status: 400, description: 'Error en la creación de membresía' })
    async crearMembresiaAdmin(@Body() crearMembresiaDto: CrearMembresiaDto) {
        try {
            const membresiaNueva = await this.membresiaService.crearMembresiaNueva(crearMembresiaDto);
            return membresiaNueva;
        } catch (error) {
            throw new HttpException('Error al crear la membresía', HttpStatus.BAD_REQUEST);
        }
    }
    //*endpoint para comprar membresias siendo cliente
    @Post(':membresiaId/compra')
    @ApiOperation({ summary: 'Comprar una membresía' })
    @ApiParam({ name: 'membresiaId', description: 'ID de la membresía que se va a comprar' })
    @ApiResponse({ status: 200, description: 'Membresía comprada con éxito y asignada al usuario' })
    @ApiResponse({ status: 404, description: 'Membresía no encontrada' })
    @ApiResponse({ status: 400, description: 'Error al procesar la compra' })
    @ApiBearerAuth() // Indica en Swagger que este endpoint requiere autenticación
    @UseGuards(AuthGuard) // Protege el endpoint
    async comprarMembresia(
        @Param('membresiaId') membresiaId: string,
        @Request() req: any, // Extrae al usuario autenticado
    ) {
        const usuario = await this.usuariosService.obtenerUsuarioPorId(req.user.id);
        if (!usuario) {
            throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
        }

        const membresia = await this.membresiaService.obtenerMembresiaPorId(membresiaId);
        if (!membresia) {
            throw new HttpException('Membresía no encontrada', HttpStatus.NOT_FOUND);
        }

        if (!membresia.activa) {
            throw new HttpException('Esta membresía ya no está disponible', HttpStatus.BAD_REQUEST);
        }

        // Crear la sesión de pago con Stripe
        const session = await this.stripeService.crearSesionDePago(
            membresiaId,
            membresia.precio,
            usuario.email,
        );

        usuario.membresia = membresia;
        await this.usuariosService.update(usuario);

        return { message: 'Membresía comprada y asignada con éxito', membresia, usuario };
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las membresías' })
    @ApiResponse({ status: 200, description: 'Membresías obtenidas correctamente', type: [Membresia] })
    @HttpCode(HttpStatus.OK)
    @ApiQuery({ name: 'page', required: false, description: 'Número de página', example: 1 })
    @ApiQuery({ name: 'limit', required: false, description: 'Cantidad de resultados por página', example: 5 })
    async obtenerMembresiasPag(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 5
    ): Promise<{ data: Membresia[]; total: number; pages: number }> {
        const membresias = await this.membresiaService.obtenerMembresiasPag(page, limit);
        const total = await this.membresiaService.count();  // Contamos el total de membresías
        const pages = Math.ceil(total / limit);  // Calculamos el número total de páginas

        return {
            data: membresias,
            total,
            pages,
        };
    }
    // Obtener historial de membresías: GET /membresias/historial
    //*para que el usuario vea sus propias membresias
    @Get(':usuarioId/historial')
    @ApiOperation({ summary: 'Obtener historial de usuario por ID' })
    @ApiResponse({ status: 200, description: 'Historial obtenido', type: Membresia })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async obtenerHistorialMembresias(
        @Param('usuarioId') usuarioId: string
    ): Promise<Membresia[]> {
        const usuario = new Usuario();
        usuario.id = usuarioId;
        return this.membresiaService.obtenerHistorialMembresias(usuario);
    }

    @Get('admin/historial')
    @ApiOperation({ summary: 'Obtener el historial de membresias del usuario' })
    @ApiResponse({ status: 200, description: 'Historial de membresias obtenido exitosamente' })
    @ApiResponse({ status: 404, description: 'El usuario no tiene historial de membresias actualmente.' })
    @ApiResponse({ status: 403, description: 'No tienes permisos para acceder a esta información.' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin') // Asegura que solo los administradores tengan acceso
    async obtenerHistorialMembresiasAdmin(): Promise<Membresia[]> {
        return this.membresiaService.obtenerHistorialMembresiasAdmin();
    }
    // Obtener membresía activa: GET /membresias/activa
    @Get('membresia/activa/:id')  // Endpoint para obtener la membresía activa por el id del usuario
    @ApiOperation({ summary: 'Obtener la membresía activa de un usuario (solo admin)' })
    @ApiBearerAuth()  // Asegura que el endpoint esté protegido por JWT
    @ApiResponse({ status: 200, description: 'Membresía activa encontrada exitosamente.' })
    @ApiResponse({ status: 404, description: 'El usuario no tiene una membresía activa.' })
    @ApiResponse({ status: 403, description: 'No tienes permisos para acceder a esta información.' })
    @UseGuards(AuthGuard, RolesGuard)  // Protege el endpoint con los guards de JWT y Roles
    @Roles('admin')  // Solo los admins pueden acceder a este endpoint
    @ApiSecurity('bearer')  // Requiere autenticación mediante un token JWT
    @Get('activas')
    async obtenerMembresiasActivas(
        @Query('page') page: number = 1,      // Página actual
        @Query('limit') limit: number = 10    // Tamaño de página
    ) {
        return this.membresiaService.obtenerMembresiasActivas(page, limit);
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
            activa: membresia.activa,
        }));
    }

    @Put('desactivar/:nombre')
    async desactivarMembresia(@Param('nombre') nombre: string) {
        return this.membresiaService.desactivarMembresia(nombre);
    }
    // Actualizar precio de membresía: PUT/membresias/precio

    @Put(':membresiaId/precio')
    @ApiOperation({ summary: 'Actualizar el precio de una membresía por ID' })
    @ApiResponse({ status: 200, description: 'Membresía actualizada', type: Membresia })
    @ApiResponse({ status: 404, description: 'Membresía no encontrada' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiSecurity('bearer')
    @HttpCode(HttpStatus.OK)
    async actualizarPrecioMembresia(
        @Param('membresiaId') membresiaId: string,
        @Body() actualizarPrecio: ActualizarPrecioMembresiaDto
    ): Promise<Membresia> {
        // Llamamos al servicio para actualizar el precio
        return this.membresiaService.actualizarPrecioMembresia(membresiaId, actualizarPrecio);
    }
    // renovarMembresia: Método: PATCH /membresias/renovar
    @Patch('renovar/:userId')
    @UseGuards(AuthGuard, RolesGuard)
    @ApiOperation({ summary: 'Renovar una membresia por ID' })
    @ApiResponse({ status: 200, description: 'Membresia renovada', type: Membresia })
    @ApiResponse({ status: 404, description: 'Membresia no encontrada' })
    @HttpCode(HttpStatus.OK)
    async renovarMembresia(@Param('userId') userId: string, @Request() req) {
        // Verificamos si el usuario es admin o si el usuario está intentando renovar su propia membresía
        if (!req.user.isAdmin && req.user.id !== userId) {
            throw new ForbiddenException('No tienes permiso para renovar esta membresía.');
        }

        // Obtener el usuario al que le corresponde la membresía a renovar
        const usuario = await this.usuariosService.obtenerUsuarioPorId(userId);

        // Llamamos al servicio para renovar la membresía
        const membresiaRenovada = await this.membresiaService.renovarMembresia(usuario);

        // Devolver la membresía renovada como respuesta
        return membresiaRenovada;
    }


    // Endpoint para que el usuario inhabilite su propia membresía 
    @Patch('cancelar')
    @ApiOperation({ summary: 'Cancelar la membresía activa del usuario' })
    @ApiBearerAuth()  // Asegura que el endpoint esté protegido por JWT
    @ApiResponse({ status: 200, description: 'Membresía cancelada correctamente.' })
    @ApiResponse({ status: 404, description: 'No tienes una membresía activa para cancelar.' })
    @ApiResponse({ status: 403, description: 'No tienes permisos para cancelar esta membresía.' })
    @UseGuards(AuthGuard, RolesGuard)
    @UseGuards(AuthGuard)

    async cancelarMembresia(@Req() req) {
        const userId = req.user.id;
        return this.membresiaService.cancelarMembresia(userId);
    }

    // Endpoint para que el admin inhabilite cualquier membresía
    @Patch('cancelar/:id')
    @ApiOperation({ summary: 'Cancelar la membresía activa del usuario' })
    @ApiBearerAuth()  // Asegura que el endpoint esté protegido por JWT
    @ApiResponse({ status: 200, description: 'El Admin canceló la membresia exitosamente' })
    @ApiResponse({ status: 404, description: 'El usuario no tiene una membresía activa para cancelar.' })
    @ApiResponse({ status: 403, description: 'No tienes permisos para cancelar esta membresía.' })
    @UseGuards(AuthGuard, RolesGuard)
    @Roles("admin")

    async cancelarMembresiaPorAdmin(@Param('id') userId: string) {
        return this.membresiaService.cancelarMembresia(userId);
    }

    @Post('checkout')
    @ApiOperation({ summary: 'Create a Stripe Checkout session' })
    @ApiResponse({ status: 200, description: 'Checkout session created', schema: { example: { url: 'https://checkout.stripe.com/pay/cs_test_12345' } } })
    @ApiResponse({ status: 500, description: 'Internal Server Error' })
    @ApiBody({
      description: 'Parameters to create a Checkout session',
      schema: {
        type: 'object',
        properties: {
          membresiaId: { type: 'string', example: 'membresia_123' },
          precio: { type: 'number', example: 2000 },
          email: { type: 'string', example: 'user@example.com' },
        },
      },
    })
    async createCheckoutSession(
      @Body('membresiaId') membresiaId: string,
      @Body('precio') precio: number,
      @Body('email') email: string,
    ) {
      try {
        const session = await this.stripeService.crearSesionDePago(membresiaId, precio, email);
        return {sessionId: session.id, url: session.url }; // Devolvemos la URL para redirigir al frontend
      } catch (error) {
        console.error('Error creating checkout session:', error);
        throw new Error('Failed to create checkout session');
      }
    }
    

    
    
}









//GET
//POST
//PUT
//DELETE