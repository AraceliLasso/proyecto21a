import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class SearchDtoo {
    @ApiProperty({ description: 'Nombre de la clase a buscar', required: false, type: String })
    @IsOptional()
    @IsString()
    claseNombre?: string;

    @ApiProperty({ description: 'Nombre de la categoría a buscar', required: false, type: String })
    @IsOptional()
    @IsString()
    categoriaNombre?: string;
    @ApiProperty({ description: 'Nombre del profesor a buscar', required: false, type: String })
    @IsOptional()
    @IsString()
    perfilProfesorNombre?: string;

    @ApiProperty({ description: 'Descripción del contenido a buscar', required: false, type: String })
    @IsOptional()
    @IsString()
    descripcion?: string;


}

