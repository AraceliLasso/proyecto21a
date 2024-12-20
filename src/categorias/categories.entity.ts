import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Clase } from "src/clases/clase.entity";

@Entity({
    name: "categorias"
})
export class Categoria {
    @ApiProperty({
        type: String,
        description: "Identificador único de la categoría",
        required: true,
    })
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ApiProperty({
        type: String,
        description: "Nombre de la categoría",
        required: true,
    })
    @Column({ length: 100, nullable: false, unique: true })
    nombre: string;

    @OneToMany(() => Clase, (clases) => clases.categoria)
    clases: Clase[]

    @ApiProperty({ 
        type: String,
        description: "URL de la imagen de la categoría", 
        })
    @Column({ nullable: true })
    imagen?: string;

    @Column({ default: true }) // Por defecto, la categoria estará activa
    estado: boolean


}
