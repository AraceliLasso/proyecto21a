import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

export class CrearPerfilProfesorDto {
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

    @ApiProperty({
        type: 'string',
        format: 'binary', 
        description: 'Imagen del perfil del profesor',
        required: false
    })
    imagen?: any;

}