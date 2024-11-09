
import { IsString, IsInt, Min, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActualizarPrecioMembresiaDto {
s
  @ApiProperty({ description: 'Precio de la membresía en números enteros' })
  @IsInt()
  @IsPositive()
  precio: number;

}
