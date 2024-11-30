import { Inscripcion } from "src/inscripciones/inscripcion.entity";
import { Membresia } from "src/membresias/membresia.entity";
import { PerfilProfesor } from "src/perfilesProfesores/perfilProfesor.entity";
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";

export enum rolEnum {
    ADMIN = 'admin',
    PROFESOR = 'profesor',
    CLIENTE = 'cliente',
}

@Entity({
    name: 'usuarios'
})
export class Usuario {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 80, nullable: false })
    nombre: string;

    @Column({ nullable: true })
    edad: number;

    @Column({ nullable: true })
    telefono: number;

    @Column({ length: 50, unique: true, nullable: false })
    email: string;

    @Column({ nullable: false })
    contrasena: string;

    @Column({
        type: 'enum',
        enum: rolEnum,
        default: rolEnum.CLIENTE,
    })
    rol: rolEnum;

    @Column({ nullable: true })
    imagen: string;


    @OneToOne(() => PerfilProfesor, (perfilProfesor)=>perfilProfesor.usuario)
    perfilProfesor: PerfilProfesor;

    @OneToOne(()=> Membresia, (membresia)=> membresia.usuario, { eager: true, cascade: true }) //eager: true carga las relaciones aut. siempre que se busque un usuario, cascade:true crea o actualiza las relaciones si las prop se incluyen en las operaciones
    membresia:Membresia;

    @OneToMany(()=> Inscripcion, (inscripciones) => inscripciones.usuario, { eager: true, cascade: true })
    inscripciones:Inscripcion[];

    @Column({ default: true }) // Por defecto, el usuario estará activo
    estado: boolean;
}
