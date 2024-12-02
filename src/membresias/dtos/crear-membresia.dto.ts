// dto/create-membresia.dto.ts
import { IsString, IsInt, Min, IsPositive, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearMembresiaDto {
  @ApiProperty({ description: 'Nombre del tipo de membresía (por ejemplo: "Membresía Gold")' })
  @IsString()
  nombre: string;

  @ApiProperty({ description: 'Precio de la membresía en números enteros' })
  @IsInt()
  @IsPositive()
  precio: number;

  @ApiProperty({ description: 'Duración en meses de la membresía' })
  @IsInt()
  @Min(1)
  duracionEnMeses: number;

  @ApiProperty({ description: 'Descripción detallada de la membresía', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'Características del plan de la membresía',
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  features?: string[];
}
