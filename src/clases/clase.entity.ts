import { Categoria } from "src/categorias/categories.entity";
import { Inscripcion } from "src/inscripciones/inscripcion.entity";
import { PerfilProfesor } from "src/perfilesProfesores/perfilProfesor.entity";
import { Entity, PrimaryGeneratedColumn, Column, IntegerType, OneToOne, OneToMany, ManyToOne, JoinColumn } from "typeorm";


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
    fecha: Date

    @Column({ nullable: true })
    disponibilidad: number;

    @Column({ nullable: true })
    imagen: string;


    @Column({ type: 'uuid', name: "categoriaId", nullable: false })
    categoriaId: string;

    @ManyToOne(() => Categoria, (categoria) => categoria.clases)
    @JoinColumn({ name: "categoriaId" })
    categoria: Categoria;

    @ManyToOne(() => PerfilProfesor, (perfilProfesor) => perfilProfesor.clases)
    perfilProfesor: PerfilProfesor;

    @OneToMany(() => Inscripcion, (inscripciones) => inscripciones.clase)
    inscripciones: Inscripcion[];
}