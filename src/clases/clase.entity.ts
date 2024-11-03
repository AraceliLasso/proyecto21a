import { Categorias } from "src/categorias/categories.entity";
import { Profesores } from "src/profesores/profesor.entity";
import { Usuario } from "src/usuarios/usuario.entity";
import { Entity, PrimaryGeneratedColumn, Column, IntegerType, OneToOne, OneToMany, ManyToOne } from "typeorm";


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

    @OneToOne(() => Usuario, (usuario) => usuario.clases)
    usuario: Usuario;

    @ManyToOne(() => Categorias, (categorias) => categorias.clases)
    categorias: Categorias;

    @ManyToOne(() => Profesores, (profesores) => profesores.clases)
    profesores: Profesores;
}