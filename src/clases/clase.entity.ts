import { Categoria } from "src/categorias/categories.entity";
import { PerfilProfesor } from "src/profesores/profesor.entity";
import { Entity, PrimaryGeneratedColumn, Column, IntegerType, OneToOne, OneToMany, ManyToOne } from "typeorm";


@Entity({
    name: "clases",
})

export class Clase {
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


    @ManyToOne(() => Categoria, (categorias) => categorias.clases)
    categorias: Categoria;

    @ManyToOne(() => PerfilProfesor, (perfilesProfesores) => perfilesProfesores.clases)
    perfilesProfesores: PerfilProfesor;
}