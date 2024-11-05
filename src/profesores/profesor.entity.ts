import { Clase } from "src/clases/clase.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";


@Entity({
    name: "perfilesProfesores",
})

export class PerfilProfesor {
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

    @OneToMany(() => Clase, (clases) => clases.perfilesProfesores)
    clases: Clase[]

}