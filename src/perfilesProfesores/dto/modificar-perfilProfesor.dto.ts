import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsNumber, IsString, IsUUID } from "class-validator";

export class ModificarPerfilProfesorDto {
    @ApiProperty({ description: "El nombre del profesor", required: false })
    @IsOptional()
    @IsString()
    nombre?: string;

    @ApiProperty({ description: "La descripción del profesor", required: false })
    @IsOptional()
    @IsString()
    descripcion?: string;


    @ApiProperty({ description: "La certificación del profesor", required: false })
    @IsOptional()
    @IsString()
    certificacion?: string;

    @ApiProperty({
        type: 'string',
        format: 'binary', 
        description: 'Imagen del perfil del profesor',
        required: false
    })
    @IsOptional()
    imagen?: any;

}