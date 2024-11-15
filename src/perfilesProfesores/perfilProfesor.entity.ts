import { Clase } from "src/clases/clase.entity";
import { Usuario } from "src/usuarios/usuario.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from "typeorm";


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

    @OneToMany(() => Clase, (clases) => clases.perfilProfesor)
    clases: Clase[]

    // @OneToOne(()=>Usuario, (usuario)=> usuario.perfilProfesor)
    // @JoinColumn()
    // usuario:Usuario

}