import { PerfilProfesor } from "src/profesores/profesor.entity";
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

    @OneToOne(() => PerfilProfesor)
    @JoinColumn()
    perfilesProfesores: PerfilProfesor;
}
