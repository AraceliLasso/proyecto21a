// dto/create-membresia.dto.ts
import { IsString, IsInt, Min, IsPositive } from 'class-validator';
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
}
