import { Entity, PrimaryGeneratedColumn, Column, IntegerType } from "typeorm";


@Entity({
    name: "clases",
})

export class Clases {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    nombre: string;

    @Column({ nullable: false })
    descripcion: string;

    @Column({ nullable: false })
    horario: Date;

    @Column({ nullable: true })
    disponibilidad: number;

    @Column({ nullable: true })
    imagen: string;
}