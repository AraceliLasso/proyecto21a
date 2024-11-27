import { ApiProperty } from "@nestjs/swagger";
import { Categoria } from "src/categorias/categories.entity";
import { Inscripcion } from "src/inscripciones/inscripcion.entity";
import { PerfilProfesor } from "src/perfilesProfesores/perfilProfesor.entity";
import { Entity, PrimaryGeneratedColumn, Column, IntegerType, OneToOne, OneToMany, ManyToOne, JoinColumn } from "typeorm";


@Entity({
    name: "clases",
})

export class Clase {
    @ApiProperty({
        type: String,
        description: "Identificador único de la clase",
        required: true,
    })
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ApiProperty({
        type: String,
        description: "Nombre de la clase",
        required: true,
    })
    @Column({ length: 100, unique: true })
    nombre: string;

    @ApiProperty({
        type: String,
        description: "Descripcion de la clase",
        required: true,
    })
    @Column({ length: 100,  unique: true })
    descripcion: string;

    @ApiProperty({
        type: Date,
        description:'Fecha y hora de la cita en formato ISO', example: '2024-10-10T14:00:00Z', 
        required: true,
    })
    @Column({ nullable: false })
    fecha: Date


    @ApiProperty({
        type: Number,
        description: "La disponibilidad de clases",
        required: true,
    })
    @Column({ nullable: true })
    disponibilidad: number;


    @ApiProperty({ 
        type: String,
        description: "URL de la imagen de la clase", 
        required: true })
    @Column({ nullable: true })
    imagen: string;

    @ApiProperty({
        type: String,
        description: "Identificador único de la categoria",
        required: true,
    })
    @Column({ type: 'uuid', name: "categoriaId", nullable: false })
    categoriaId: string;

    
    @ManyToOne(() => Categoria, (categoria) => categoria.clases, )
    @JoinColumn({ name: "categoriaId" })
    categoria: Categoria;

    @ManyToOne(() => PerfilProfesor, (perfilProfesor) => perfilProfesor.clases, { eager: true })
    @JoinColumn({ name: 'perfilProfesorId' })
    perfilProfesor: PerfilProfesor;
    
    
    @Column({ type: 'uuid', name: 'perfilProfesorId', nullable: false })
    perfilProfesorId: string;

    @OneToMany(() => Inscripcion, (inscripciones) => inscripciones.clase, )
    inscripciones: Inscripcion[];
}