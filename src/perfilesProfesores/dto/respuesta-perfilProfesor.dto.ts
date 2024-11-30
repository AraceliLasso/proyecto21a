import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

export class RespuestaPerfilProfesorDto {

    @ApiProperty({
        type: String,
        description: "El identificador único del perfil del profesor, asignado por la base de datos",
        required: true,
        })
        id: string;

    @ApiProperty({ description: "El nombre del profesor", required: true })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ description: "La descripción del profesor", required: true })
    @IsString()
    @IsNotEmpty()
    descripcion: string;


    @ApiProperty({ description: "La certificación del profesor", required: true })
    @IsString()
    @IsNotEmpty()
    certificacion: string;

    @ApiProperty({ description: "URL de la imagen del perfil del profesor", required: false })
    @IsString()
    
    imagen?: string;


}