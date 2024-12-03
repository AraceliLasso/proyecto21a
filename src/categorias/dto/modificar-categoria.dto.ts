import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty,  IsString } from "class-validator";

export class ModificarCategoriaDto{
    @ApiProperty({
        description: "El nombre de la categoría",
        required: false,
    
    })
    @IsString()
    nombre?: string;

    @ApiProperty({
        type: 'string',
        format: 'binary', 
        description: 'Imagen de la clase',
    })
    imagen?: any;


}
