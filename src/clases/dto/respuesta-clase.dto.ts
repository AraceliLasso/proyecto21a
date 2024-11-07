import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

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

    @ApiProperty({ description: "La descripción de la clase", required: true })
    @IsNotEmpty()
    fecha: Date;

    @ApiProperty({ description: "El horario de la clase", required: true })
    @IsString()
    @IsNotEmpty()
    horario: string;

    @ApiProperty({ description: "La disponibilidad de clases", required: true })
    @IsNumber()
    @IsNotEmpty()
    disponibilidad: number;

    @ApiProperty({ description: "URL de la imagen de la clase", required: true })
    @IsString()
    @IsNotEmpty()
    imagen: string;

    @ApiProperty({ description: "ID de la categoría", required: true })
    @IsUUID()
    @IsNotEmpty()
    categoriaId: string;

    @ApiProperty({ description: "ID del profesor", required: true })
    @IsUUID()
    @IsNotEmpty()
    perfilProfesorId: string;

}