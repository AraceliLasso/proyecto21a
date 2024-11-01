import { Clases } from "src/clases/clase.entity";
import { Usuario } from "src/usuarios/usuario.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";

export enum Statusenum {
  PENDIENTE = 'Pendiente',
  COMPLETADO = 'Atendido',
  PAID = 'Pagado',
}

@Entity({
  name: "turnos",
})

export class Turnos {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  fechaReserva: Date;

  @Column({ default: 'Pendiente' })
  estado: Statusenum;

  @Column({ nullable: true })
  esGratuito: boolean;

  @Column({ nullable: true })
  estaPago: boolean;

  @ManyToOne(() => Usuario, (usuario) => usuario.turnos)
  usuario: Usuario;

  @ManyToOne(() => Clases, (clases) => clases.turnos)
  clases: Clases;

}

