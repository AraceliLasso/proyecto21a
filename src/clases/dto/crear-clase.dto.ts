import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";


export class CrearClaseDto {
    @ApiProperty({ description: "El nombre de la clase", required: true })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ description: "La descripción de la clase", required: true })
    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @ApiProperty({ description: 'Fecha y hora de la clase en string', required: false })
    @IsString()
    fecha: string;

    @ApiProperty({ type: Number, description: "La disponibilidad de clases", required: true })
    @IsNumber()
    @IsNotEmpty()
    disponibilidad: number;

    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'Imagen de la clase',
    })
    imagen: any;

    @ApiProperty({ description: "ID de la categoría", required: true })
    @IsUUID()
    @IsNotEmpty()
    categoriaId: string;

    @ApiProperty({ description: "ID del profesor", required: true })
    @IsUUID()
    @IsNotEmpty()
    perfilProfesorId: string;

}

function IsOptional(): (target: CrearClaseDto, propertyKey: "imagen") => void {
    throw new Error("Function not implemented.");
}
