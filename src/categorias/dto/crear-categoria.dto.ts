import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty,  IsString, IsUUID } from "class-validator";

export class CrearCategoriaDto {
    @ApiProperty({
        type: String,
        description: "El identificador único de la categoria, asignado por la base de datos",
        required: true,
        })
        @IsUUID()
        id: string;

    @ApiProperty({ description: "El nombre de la categoria", required: true })
    @IsString()
    @IsNotEmpty()
    nombre: string;
}