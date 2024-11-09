import { ApiProperty } from "@nestjs/swagger";

export class RespuestaCategoriaDto {
    @ApiProperty({
        type: String,
        description: "El identificador único de la categoría",
        required: true,
    })
    id: string;

    @ApiProperty({
        type: String,
        description: "El nombre de la categoría",
        required: true,
    })
    nombre: string;

    constructor(id: string, nombre: string) {
        this.id = id;
        this.nombre = nombre;
    }
}
