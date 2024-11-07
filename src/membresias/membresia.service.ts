// membresia.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MoreThan, Repository } from 'typeorm';
import { Membresia } from './membresia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/usuario.entity';

@Injectable()
export class MembresiaService {
    constructor(
        @InjectRepository(Membresia)
        private readonly membresiasRepository: Repository<Membresia>,
    ) { }

    // Función para comprar una membresía
    async comprarMembresia(usuario: Usuario, nombre: string, precio: number, duracionEnMeses: number): Promise<Membresia> {
        // Verificar si el tipo de membresía está activo
        const membresiaExistente = await this.membresiasRepository.findOne({ where: { nombre, activo: true } });
    
        if (!membresiaExistente) {
            throw new BadRequestException('El tipo de membresía no está disponible para la compra.');
        }
    
        // Buscar membresía existente del usuario
        let membresia = await this.membresiasRepository.findOne({ where: { usuario } });
    
        if (!membresia) {
            membresia = this.membresiasRepository.create({ usuario });
        }
    
        // Si la membresía ya está activa y no ha expirado, no cambiamos el precio
        if (membresia.activo && membresia.fechaExpiracion > new Date()) {
            // No actualizamos el precio si ya está activa y no ha expirado
            return membresia;
        }
    
        // Actualizamos los datos de la membresía (nombre, precio, duración, etc.)
        membresia.nombre = nombre;
        membresia.precio = precio;  // Se aplica el nuevo precio
        membresia.duracionEnMeses = duracionEnMeses;
        membresia.fechaExpiracion = this.calcularFechaExpiracion(duracionEnMeses);
        membresia.activo = true;  // Marcamos como activa
    
        return this.membresiasRepository.save(membresia);
    }
    

    // Función para renovar una membresía
    async renovarMembresia(usuario: Usuario): Promise<Membresia> {
        const membresia = await this.membresiasRepository.findOne({
            where: { usuario, activo: true, fechaExpiracion: MoreThan(new Date()) },
        });

        if (!membresia) {
            throw new NotFoundException('No tienes una membresía activa para renovar.');
        }

        // Verificamos si la membresía aún está activa antes de renovarla
        if (!membresia.activo) {
            throw new BadRequestException('El tipo de membresía ya no está disponible para renovar.');
        }

        membresia.fechaExpiracion = this.calcularFechaExpiracion(membresia.duracionEnMeses);

        return this.membresiasRepository.save(membresia);
    }

    // Función para desactivar una membresía como admin
    async desactivarMembresia(nombre: string): Promise<Membresia> {
        // Buscar la membresía por nombre
        const membresia = await this.membresiasRepository.findOne({ where: { nombre } });

        if (!membresia) {
            throw new NotFoundException('Membresía no encontrada.');
        }

        // Desactivamos el tipo de membresía
        membresia.activo = false;
        return this.membresiasRepository.save(membresia);
    }

    // Función privada para calcular la fecha de expiración
    private calcularFechaExpiracion(duracionEnMeses: number): Date {
        const fechaExpiracion = new Date();
        fechaExpiracion.setMonth(fechaExpiracion.getMonth() + duracionEnMeses);
        return fechaExpiracion;
    }
    async obtenerHistorialMembresias(usuario: Usuario): Promise<Membresia[]> {
        return this.membresiasRepository.find({
            where: { usuario }, // Obtén todas las membresías del usuario
            order: { fechaCreacion: 'DESC' }, // Ordenar por fecha de creación
        });
    }

    async obtenerHistorialMembresiasAdmin(): Promise<Membresia[]> {
        return this.membresiasRepository.find({
            order: { fechaCreacion: 'DESC' }, // Ordenar por fecha de creación
        });
    }
    async obtenerMembresiaActiva(usuario: Usuario): Promise<Membresia> {
        const membresia = await this.membresiasRepository.findOne({
            where: { usuario, activo: true, fechaExpiracion: MoreThan(new Date()) }, // Verifica que esté activa y no haya expirado
        });

        if (!membresia) {
            throw new NotFoundException('No tienes una membresía activa.');
        }

        return membresia;
    }
    async obtenerMembresiasInactivas(): Promise<Membresia[]> {
        return this.membresiasRepository.find({
            where: { activo: false }, // Membresías que están inactivas
            order: { fechaExpiracion: 'ASC' }, // Ordenar por fecha de expiración (si es necesario)
        });
    }
    async cancelarMembresia(usuario: Usuario): Promise<Membresia> {
        const membresia = await this.membresiasRepository.findOne({
            where: { usuario, activo: true },
        });
    
        if (!membresia) {
            throw new NotFoundException('No tienes una membresía activa para cancelar.');
        }
    
        membresia.activo = false; // Desactivar la membresía
        return this.membresiasRepository.save(membresia);
    }
    async cancelarMembresiaAdmin(nombre: string): Promise<Membresia> {
        const membresia = await this.membresiasRepository.findOne({ where: { nombre, activo: true } });
    
        if (!membresia) {
            throw new NotFoundException('Membresía no encontrada o ya está inactiva.');
        }
    
        membresia.activo = false; // Desactivar la membresía
        return this.membresiasRepository.save(membresia);
    }

    async actualizarPrecioMembresia(nombre: string, nuevoPrecio: number): Promise<Membresia> {
        // Buscar la membresía activa por nombre
        const membresia = await this.membresiasRepository.findOne({ where: { nombre, activo: true } });
    
        if (!membresia) {
            throw new NotFoundException('Membresía no encontrada o ya no está activa.');
        }
    
        // Si la membresía está activa y no ha expirado, no actualizamos el precio
        if (membresia.fechaExpiracion > new Date()) {
            throw new BadRequestException('El precio de la membresía no se puede cambiar mientras esté activa y sin expirar.');
        }
    
        // Si la membresía ha expirado o está inactiva, actualizamos el precio
        membresia.precio = nuevoPrecio;
        return this.membresiasRepository.save(membresia);
    }
    
        
}
