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
    name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}
