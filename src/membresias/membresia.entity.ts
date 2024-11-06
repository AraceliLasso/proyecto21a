import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Usuario } from "src/usuarios/usuario.entity";
import { Inscripcion } from "src/inscripciones/inscripcion.entity";

export enum membresiaEnum {
    BASICA = "basica",
    INTERMEDIA = "intermedia",
    PREMIUM = "premium"
}

@Entity({
    name: "membresias"
})
export class Membresia {
    @ApiProperty({
        type: String,
        description: "Identificador único de la membresia",
        required: true,
    })
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: 'enum',
        enum: membresiaEnum,
    })
    membresia: membresiaEnum;

    @OneToOne(() => Usuario, (usuario)=>usuario.membresia)
    @JoinColumn()
    usuario:Usuario;

    @OneToMany(() => Inscripcion, (inscripciones) => inscripciones.membresia)
    inscripciones: Inscripcion[]

}
