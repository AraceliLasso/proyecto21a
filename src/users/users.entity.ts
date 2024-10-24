import { Entity, Column, PrimaryGeneratedColumn,} from "typeorm";

export enum rolEnum {
    ADMIN = 'Admin',
    PREMIUM = 'Premium',
    NORMAL = 'Normal',
  }
@Entity({
    name: 'users'
})
export class User {

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

}