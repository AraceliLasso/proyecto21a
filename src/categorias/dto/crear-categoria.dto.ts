import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty,  IsString, IsUUID } from "class-validator";

export class CrearCategoriaDto {
    
    @ApiProperty({ description: "El nombre de la categoria", required: true})
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({
        type: 'string',
        format: 'binary', 
        description: 'Imagen de la clase',
    })
    imagen?: any;

}