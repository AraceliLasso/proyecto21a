import { PartialType } from '@nestjs/mapped-types';
import { ModificarClaseDto } from './modificar-clase.dto';
import { ApiProperty } from '@nestjs/swagger';


export class ActualizarImagenClaseDto {

    @ApiProperty({
        type: 'string',
        format: 'binary', 
        description: 'Imagen de la clase',
    })
    imagen?: any;
    
}