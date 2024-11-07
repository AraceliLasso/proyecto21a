import { ApiProperty } from "@nestjs/swagger";

export class ModificarCategoriaDto{
    @ApiProperty({
        type: String,
        description: "El nombre de la categoría",
        required: true,
    })
    nombre: string;

}