import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity({
    name: "categorias"
})
export class Categorias {
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
}
