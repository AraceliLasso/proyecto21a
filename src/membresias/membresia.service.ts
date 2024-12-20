// membresia.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MoreThan, Repository } from 'typeorm';
import { Membresia } from './membresia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/usuario.entity';
import { ActualizarPrecioMembresiaDto } from './dtos/actualizar-membresia.dto';
import { CrearMembresiaDto } from './dtos/crear-membresia.dto';

@Injectable()
export class MembresiaService {
    constructor(
        @InjectRepository(Membresia)
        private readonly membresiasRepository: Repository<Membresia>,
    ) { }

    //*Funcion para crear membresia como admin
    async crearMembresiaNueva(crearMembresiaDto: CrearMembresiaDto): Promise<Membresia> {
        const { nombre, precio, duracionEnMeses, descripcion, features } = crearMembresiaDto;
    
        // Se calcula la fecha de expiración de la membresía
        const fechaExpiracion = new Date();
        fechaExpiracion.setMonth(fechaExpiracion.getMonth() + duracionEnMeses);
    
        // Crear la nueva membresía
        const membresiaNueva = this.membresiasRepository.create({
            nombre,
            precio,
            duracionEnMeses,
            fechaExpiracion,
            activa: true,  // La membresía está activa por defecto
            descripcion,   // Se agrega la descripción
            features,      // Se agregan las características
        });
    
        // Guardar la membresía en la base de datos
        return await this.membresiasRepository.save(membresiaNueva);
    }

    // Función para comprar una membresía
    async comprarMembresia(usuario: Usuario, nombre: string, precio: number, duracionEnMeses: number): Promise<Membresia> {
        // Verificar si el tipo de membresía está activo
        const membresiaExistente = await this.membresiasRepository.findOne({ where: { nombre, activa: true } });

        if (!membresiaExistente) {
            throw new BadRequestException('El tipo de membresía no está disponible para la compra.');
        }

        // Buscar membresía existente del usuario
        let membresia = await this.membresiasRepository.findOne({ where: { usuario } });

        if (!membresia) {
            membresia = this.membresiasRepository.create({ usuario });
        }

        // Si la membresía ya está activa y no ha expirado, no cambiamos el precio
        if (membresia.activa && membresia.fechaExpiracion > new Date()) {
            // No actualizamos el precio si ya está activa y no ha expirado
            return membresia;
        }

        // Actualizamos los datos de la membresía (nombre, precio, duración, etc.)
        membresia.nombre = nombre;
        membresia.precio = precio;  // Se aplica el nuevo precio
        membresia.duracionEnMeses = duracionEnMeses;
        membresia.fechaExpiracion = this.calcularFechaExpiracion(duracionEnMeses);
        membresia.activa = true;  // Marcamos como activa

        return this.membresiasRepository.save(membresia);
    }


    // Función para renovar una membresía
    async renovarMembresia(usuario: Usuario): Promise<Membresia> {
        const membresia = await this.membresiasRepository.findOne({
            where: { usuario, activa: true, fechaExpiracion: MoreThan(new Date()) },
        });

        if (!membresia) {
            throw new NotFoundException('No tienes una membresía activa para renovar.');
        }

        // Verificamos si la membresía aún está activa antes de renovarla
        if (!membresia.activa) {
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
        membresia.activa = false;
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
    async obtenerMembresiaActivaPorUsuario(userId: string): Promise<Membresia> {
        const membresia = await this.membresiasRepository.findOne({
            where: {
                usuario: { id: userId },
                activa: true,
                fechaExpiracion: MoreThan(new Date()),
            },
        });
    
        if (!membresia) {
            throw new NotFoundException('El usuario no tiene una membresía activa');
        }
    
        return membresia;
    }
    async obtenerMembresiasActivas(page: number, limit: number) {
        const [data, total] = await this.membresiasRepository.findAndCount({
            where: { activa: true },
            take: limit,
            skip: (page - 1) * limit,
        });

        return {
            data,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }

    async obtenerMembresiasInactivas(
        page: number = 1,
        limit: number = 5,
    ): Promise<Membresia[]> {
        // Calcular el desplazamiento (skip) basado en la página y el límite
        const skip = (page - 1) * limit;

        // Obtener las membresías inactivas de los usuarios
        return this.membresiasRepository.find({
            where: {
                activa: false, // Membresía inactiva
                fechaExpiracion: MoreThan(new Date()), // Fecha de expiración no pasada
            },
            skip, // Paginación
            take: limit, // Paginación
            relations: ['usuario'], // Incluir relación con 'usuario' para obtener los datos del usuario
        });
    }
    
    // Función para que el usuario cancele su propia membresía
    async cancelarMembresia(id: string): Promise<Membresia> {
        const membresia = await this.membresiasRepository.findOne({
            where: { id, activa: true },
        });

        if (!membresia) {
            throw new NotFoundException('No se encontró una membresía activa para el usuario.');
        }

        membresia.activa = false;
        return this.membresiasRepository.save(membresia);
    }

    // Función para que el admin cancele cualquier membresía
    async cancelarMembresiaPorAdmin(id: string): Promise<Membresia> {
        const membresia = await this.membresiasRepository.findOne({
            where: { id, activa: true },
        });

        if (!membresia) {
            throw new NotFoundException('No se encontró una membresía activa para el usuario.');
        }

        membresia.activa = false;
        return this.membresiasRepository.save(membresia);
    }
    async actualizarPrecioMembresia(
        membresiaId: string,
        actualizarPrecioDto: ActualizarPrecioMembresiaDto
      ): Promise<Membresia> {
        // Desestructuración del DTO para obtener el nuevo precio
        const { precio: nuevoPrecio } = actualizarPrecioDto;
    
        // Buscar la membresía por su ID y verificar si está activa
        const membresia = await this.membresiasRepository.findOne({
          where: { id: membresiaId, activa: true },
        });
    
        if (!membresia) {
          // Si no encontramos la membresía o no está activa
          throw new NotFoundException('Membresía no encontrada o ya no está activa.');
        }
    
        // Verificación de la fecha de expiración
        console.log('Fecha de expiración:', membresia.fechaExpiracion);
        console.log('Fecha actual:', new Date());
    

    
        // Si la membresía ya expiró o está inactiva, permitimos actualizar el precio
        membresia.precio = nuevoPrecio;
    
        // Guardamos la membresía actualizada en la base de datos
        return this.membresiasRepository.save(membresia);
      }
    async obtenerMembresiaPorId(id: string): Promise<Membresia | undefined> {
        return this.membresiasRepository.findOne({ where: { id } });
    }
    async obtenerMembresiasPag(page: number = 1, limit: number = 5): Promise<Membresia[]> {
        const skip = (page - 1) * limit;
        return this.membresiasRepository.find({
            skip,
            take: limit,
        });
    }
    // Método para contar el total de membresías
    async count(): Promise<number> {
        return this.membresiasRepository.count(); // Devuelve el total de membresías en la base de datos
    }

    async modificarEstadoId(id: string, activa: boolean): Promise<Membresia>{
        const membresia = await this.membresiasRepository.findOne({ where: { id } });

        if (!membresia) {
            throw new NotFoundException('Membresia no encontrada');
        }

        membresia.activa = activa;
        await this.membresiasRepository.save(membresia);

        return this.membresiasRepository.findOne({ where: { id } });
    }

}
