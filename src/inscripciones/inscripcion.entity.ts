import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Clase } from "src/clases/clase.entity";
import { Membresia } from "src/membresias/membresia.entity";
import { Usuario } from "src/usuarios/usuario.entity";

export enum EstadoInscripcion {
    ACTIVA = 'activa',
    INACTIVA = 'inactiva',
}
@Entity({
    name: "inscripciones"
})
export class Inscripcion {
    @ApiProperty({
        type: String,
        description: "Identificador único de la categoría",
        required: true,
    })
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ApiProperty({
        type: Date,
        description: "Fecha de inscripcion",
        required: true,
    })
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaInscripcion: Date;


    @ApiProperty({
        type: Date,
        description: "Fecha de vencimiento de la inscripcions",
        required: true,
    })
    @Column({ type: 'timestamp', nullable: true })
    fechaVencimiento: Date;

    @Column({
        type: 'enum',          // Especifica que esta columna será un enum
        enum: EstadoInscripcion,  // Aquí asignamos el enum que definimos antes
        default: EstadoInscripcion.ACTIVA,  // Valor predeterminado
    })
    estado: EstadoInscripcion;

    @ManyToOne(() => Clase, (clase) => clase.inscripciones)
    clase: Clase;

    @ManyToOne(() => Membresia, (membresia) => membresia.inscripciones)
    membresia: Membresia;

    @ManyToOne(() => Usuario, (usuario) => usuario.inscripciones)
    usuario: Usuario;
}
