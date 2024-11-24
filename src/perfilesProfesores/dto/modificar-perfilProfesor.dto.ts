import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

export class ModificarPerfilProfesorDto {
    @ApiProperty({ description: "El nombre del profesor", required: true })
    @IsString()
    nombre?: string;

    @ApiProperty({ description: "La descripción del profesor", required: true })
    @IsString()
    descripcion?: string;


    @ApiProperty({ description: "La certificación del profesor", required: true })
    @IsString()
    certificacion?: string;

    @ApiProperty({
        type: 'string',
        format: 'binary', 
        description: 'Imagen del perfil del profesor',
    })
    imagen: any;

}