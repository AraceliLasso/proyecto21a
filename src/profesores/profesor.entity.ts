import { Clases } from "src/clases/clase.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";


@Entity({
    name: "profesores",
})

export class Profesores {
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

    @OneToMany(() => Clases, (clases) => clases.profesores)
    clases: Clases[]

}