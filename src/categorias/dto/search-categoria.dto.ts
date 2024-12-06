import { ApiProperty } from '@nestjs/swagger';

export class SearchCategoriaDto {
  @ApiProperty({
    description: 'Nombre de la categoría',
    required: false,
  })
  nombre?: string;

  @ApiProperty({
    description: 'Estado de la categoría (activa o inactiva)',
    required: false,
  })
  estado?: boolean;
}
