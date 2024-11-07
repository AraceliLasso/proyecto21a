import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Usuario } from "src/usuarios/usuario.entity";
import { Inscripcion } from "src/inscripciones/inscripcion.entity";

export enum membresiaEnum {
    MENSUAL = "mensual",
    CUATRIMESTRAL = "cuatrimestral",
    ANUAL = "anual"
}

@Entity({ name: "membresias" })
export class Membresia {
    @ApiProperty({
        type: String,
        description: "Identificador único de la membresía",
        required: true,
    })
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: 'enum',
        enum: membresiaEnum,
        nullable: true // Nullable to indicate no active membership initially
    })
    tipoMembresia: membresiaEnum | null;

    @Column({
        type: 'int',
        nullable: true,
        comment: "Precio de la membresía (entero, sin decimales)",
    })
    precio: number | null;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @UpdateDateColumn({ name: 'fecha_actualizacion' })
    fechaActualizacion: Date;
    @Column({
        type: 'timestamp',
        nullable: true,
        comment: "Fecha de expiración de la membresía"
    })
    fechaExpiracion: Date | null;

    @OneToOne(() => Usuario, (usuario) => usuario.membresia)
    @JoinColumn()
    usuario: Usuario;

    @OneToMany(() => Inscripcion, (inscripciones) => inscripciones.membresia)
    inscripciones: Inscripcion[];
}
