import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { Transform, Type } from "class-transformer";

export class ModificarClaseDto {
    @ApiProperty({ description: "El nombre de la clase", required: false })
    @IsOptional()
    @IsString()
    nombre?: string;

    @ApiProperty({ description: "La descripción de la clase", required: false })
    @IsOptional()
    @IsString()
    descripcion?: string;

    @ApiProperty({ description: 'Fecha y hora de la clase en string', required: false })
    @IsOptional()
    @IsString()
    fecha?: string;


    @ApiProperty({ type: Number, description: "La disponibilidad de clases", required: false })
    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => (value !== null && value !== undefined ? Number(value) : value))
    disponibilidad?: number;

    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'Imagen de la clase',
        required: false
    })
    @IsOptional()
    imagen?: any;

    @ApiProperty({ description: "ID de la categoría", required: false })
    @IsOptional()
    @IsUUID()
    @Transform(({ value }) => value ? value : null) // Transformación para validar o asignar null
    categoriaId?: string;

    @ApiProperty({ description: "ID del profesor", required: false })
    @IsOptional()
    @IsUUID()
    @Transform(({ value }) => value ? value : null) // Transformación para validar o asignar null
    perfilProfesorId?: string;
}