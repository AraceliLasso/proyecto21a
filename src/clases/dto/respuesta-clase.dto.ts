import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
import { RespuestaCategoriaDto } from "src/categorias/dto/respuesta-categoria.dto";
import { Clase } from "../clase.entity";

export class RespuestaClaseDto {
    @ApiProperty({
        type: String,
        description: "El identificador único de la clase, asignado por la base de datos",
        required: true,
        })
        id: string;

    @ApiProperty({ description: "El nombre de la clase", required: true })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ description: "La descripción de la clase", required: true })
    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @ApiProperty({ description: 'Fecha y hora de la cita en formato ISO', example: '2024-10-10T14:00:00Z', required: true })
    @IsNotEmpty()
    fecha: Date;

    @ApiProperty({ description: "La disponibilidad de clases", required: true })
    @IsNumber()
    @IsNotEmpty()
    disponibilidad: number;

    @ApiProperty({ description: "URL de la imagen de la clase", required: true })
    @IsString()
    @IsNotEmpty()
    imagen: string;

    @ApiProperty({ description: "ID del profesor", required: true })
    @IsUUID()
    @IsNotEmpty()
    perfilProfesorId: string;

    @ApiProperty({
    type: () => RespuestaCategoriaDto, // Se indica que la categoría es un DTO
    description: "La categoría del producto",
    required: true,
    })
    categoria: RespuestaCategoriaDto;

    constructor(clases: Clase, categoria: RespuestaCategoriaDto) {
    this.id = clases.id;
    this.nombre = clases.nombre;
    this.descripcion = clases.descripcion;
    this.fecha = clases.fecha;
    this.disponibilidad = clases.disponibilidad;
    this.imagen = clases.imagen;
    //this.perfilProfesorId = clases.perfilProfesor; debo hacer lo mismo que con categoria (ver)
    this.categoria = categoria;
    
    }

    

}