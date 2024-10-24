import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";


@Entity({
    name: "profesor",
})

export class Profesor {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    nombre: string;

    @Column({ nullable: false })
    descripcion: string;

    @Column({ nullable: false })
    certificacion: string;

    @Column({ nullable: false })
    imagen: string;

    @Column({ nullable: true })
    video: string;

}