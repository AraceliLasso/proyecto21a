import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from 'src/usuarios/usuario.entity';
import { Inscripcion } from 'src/inscripciones/inscripcion.entity';

@Entity('membresias')
export class Membresia {
    @ApiProperty({ description: 'Identificador único de la membresía' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'Nombre del tipo de membresía' })
    @Column()
    nombre: string;

    @ApiProperty({ description: 'Precio de la membresía' })
    @Column({ type: 'int' })
    precio: number;

    @ApiProperty({ description: 'Duración de la membresía en meses' })
    @Column({ type: 'int' })
    duracionEnMeses: number;

    @ApiProperty({ description: 'Fecha de creación de la membresía' })
    @CreateDateColumn()
    fechaCreacion: Date;

    @ApiProperty({ description: 'Fecha de expiración de la membresía' })
    @Column({ type: 'timestamp' })
    fechaExpiracion: Date;

    @UpdateDateColumn()
    fechaActualizacion: Date;
    @Column({
        type: 'boolean',
        default: true, // Si es true, la membresía está disponible para nuevos usuarios
        nullable: false
    })
    activo: boolean;

    @OneToOne(() => Usuario, (usuario) => usuario.membresia)
    @JoinColumn()
    usuario: Usuario;

    @OneToMany(() => Inscripcion, (inscripciones) => inscripciones.membresia)
    inscripciones: Inscripcion[];
}
