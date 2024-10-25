import { Clases } from "src/clases/clase.entity";
import { Turnos } from "src/turnos/turno.entity";
import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany,} from "typeorm";

export enum rolEnum {
    ADMIN = 'Admin',
    PREMIUM = 'Premium',
    NORMAL = 'Normal',
  }
@Entity({
    name: 'usuarios'
})
export class Usuarios {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 50, nullable: false })
    nombre: string;

    @Column({ nullable: true })
    edad: number;

    @Column({ nullable: true })
    telefono: number;

    @Column({ length: 50, unique: true, nullable: false })
    email: string;

    @Column({ nullable: false })
    contrasena: string;

    @Column({ nullable: false })
    estadoMembresia: string;

    @Column({ default: 'Normal' })
    rol: rolEnum;

    @OneToOne(() => Clases)
    @JoinColumn()
    clases: Clases;

    @OneToMany(() => Turnos, (turnos) => turnos.usuarios)
    turnos: Turnos[]

}