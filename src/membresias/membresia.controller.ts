// membresia.controller.ts
import { Controller, Post, Body, Param, Put } from '@nestjs/common';
import { MembresiaService } from './membresia.service';
import { Membresia } from './membresia.entity';
import { CrearMembresiaDto } from './dtos/crear-membresia.dto';

@Controller('membresias')
export class MembresiaController {
    constructor(private readonly membresiaService: MembresiaService) { }

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

    @Put('desactivar/:nombre')
    async desactivarMembresia(@Param('nombre') nombre: string) {
        return this.membresiaService.desactivarMembresia(nombre);
    }
}
// Actualizar precio de membresía: PATCH /membresias/precio
// Obtener historial de membresías: GET /membresias/historial
// Obtener membresía activa: GET /membresias/activa
// Obtener membresías inactivas: GET /membresias/inactivas
// Cancelar membresía (usuario): DELETE /membresias/cancelar
// Cancelar membresía (admin): DELETE /membresias/cancelar/:id
// renovarMembresia: Método: PATCH o PUT /membresias/renovar





//GET
//POST
//PUT
//DELETE