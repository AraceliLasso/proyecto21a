import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty,  IsString } from "class-validator";

export class ModificarCategoriaDto{
    @ApiProperty({
        description: "El nombre de la categoría",
        required: true,
    
    })
    @IsString()
    @IsNotEmpty()
    nombre: string;

}
