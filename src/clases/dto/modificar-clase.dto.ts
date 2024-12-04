import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class ModificarClaseDto {
    @ApiProperty({ description: "El nombre de la clase", required: false })
    @IsOptional()
    @IsString()
    @MaxLength(80)
    @MinLength(3)
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
    @Transform(({ value }) => (value ? Number(value) : value))  // Convierte el valor a número si no es undefined o null
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
    categoriaId?: string;

    @ApiProperty({ description: "ID del profesor", required: false })
    @IsOptional()
    @IsUUID()
    perfilProfesorId?: string;
}