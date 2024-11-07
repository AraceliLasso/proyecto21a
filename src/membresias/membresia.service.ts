import { Injectable, NotFoundException } from '@nestjs/common';
import { Membresia } from './membresia.entity';
import { Usuario } from 'src/usuarios/usuario.entity';
import { membresiaEnum } from './membresia.entity';
import { IsNull, MoreThan, Not, Repository } from 'typeorm';

@Injectable()
export class MembresiaService {
    constructor(private readonly membresiasRepository: Repository<Membresia>) { }

    private calcularFechaExpiracion(tipo: membresiaEnum): Date {
        const fechaExpiracion = new Date();
        switch (tipo) {
            case membresiaEnum.MENSUAL:
                fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 1);
                break;
            case membresiaEnum.CUATRIMESTRAL:
                fechaExpiracion.setMonth(fechaExpiracion.getMonth() + 4);
                break;
            case membresiaEnum.ANUAL:
                fechaExpiracion.setFullYear(fechaExpiracion.getFullYear() + 1);
                break;
        }
        return fechaExpiracion;
    }

    async comprarMembresia(usuario: Usuario, tipo: membresiaEnum, precio: number): Promise<Membresia> {
        let membresia = await this.membresiasRepository.findOne({ where: { usuario } });

        if (!membresia) {
            membresia = this.membresiasRepository.create({ usuario });
        }

        membresia.tipoMembresia = tipo;
        membresia.precio = precio;
        membresia.fechaExpiracion = this.calcularFechaExpiracion(tipo);

        return this.membresiasRepository.save(membresia);
    }

    async obtenerMembresiaActiva(usuario: Usuario): Promise<Membresia | null> {
        const membresia = await this.membresiasRepository.findOne({ where: { usuario } });
        if (!membresia || (membresia.fechaExpiracion && membresia.fechaExpiracion < new Date())) {
            return null;
        }
        return membresia;
    }

    async cancelarMembresia(usuario: Usuario): Promise<Membresia> {
        const membresia = await this.obtenerMembresiaActiva(usuario);

        if (!membresia) {
            throw new NotFoundException('El usuario no tiene una membresía activa para cancelar.');
        }

        membresia.tipoMembresia = null;
        membresia.fechaExpiracion = null;
        return this.membresiasRepository.save(membresia);
    }
    async renovarMembresia(usuario: Usuario): Promise<Membresia> {
        const membresia = await this.obtenerMembresiaActiva(usuario);
        if (!membresia) {
            throw new NotFoundException('No se encuentra una membresía activa para renovar.');
        }
        // Calcular nueva fecha de expiración según el tipo de membresía
        membresia.fechaExpiracion = this.calcularFechaExpiracion(membresia.tipoMembresia);
        return this.membresiasRepository.save(membresia);
    }
    async verificarMembresiaVencida(usuario: Usuario): Promise<boolean> {
        const membresia = await this.obtenerMembresiaActiva(usuario);
        if (!membresia) {
            return true; // Si no tiene membresía, consideramos que está vencida
        }
        return membresia.fechaExpiracion < new Date();
    }

    async obtenerHistorialMembresias(usuario: Usuario): Promise<Membresia[]> {
        return this.membresiasRepository.find({ where: { usuario } });
    }
    async actualizarPrecioMembresia(usuario: Usuario, nuevoPrecio: number): Promise<Membresia> {
        // Verificar si el usuario ya tiene una membresía activa
        const membresiaActiva = await this.membresiasRepository.findOne({ where: { usuario, tipoMembresia: Not(IsNull()), fechaExpiracion: MoreThan(new Date()) } });

        if (membresiaActiva) {
            // Si la membresía ya está activa, no se cambia el precio
            return membresiaActiva;
        } else {
            // Si no tiene una membresía activa (es nueva o ha vencido), asignamos el nuevo precio
            const membresiaNueva = new Membresia();
            membresiaNueva.usuario = usuario;
            membresiaNueva.precio = nuevoPrecio; // Asignar el nuevo precio
            membresiaNueva.tipoMembresia = membresiaEnum.MENSUAL; // O el tipo de membresía que el usuario escoja
            membresiaNueva.fechaCreacion = new Date();
            membresiaNueva.fechaExpiracion = this.calcularFechaExpiracion(membresiaNueva.tipoMembresia);

            // Guardamos la nueva membresía con el nuevo precio
            return this.membresiasRepository.save(membresiaNueva);
        }
    }

}
