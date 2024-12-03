import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

export class ModificarClaseDto {
    @ApiProperty({ description: "El nombre de la clase", required: true })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ description: "La descripción de la clase", required: true })
    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @ApiProperty({ description: 'Fecha y hora de la clase en string', required: false})
    @IsString()
    fecha: string;

    @ApiProperty({ description: "La disponibilidad de clases", required: true })
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    disponibilidad: number;

    @ApiProperty({
        type: 'string',
        format: 'binary', 
        description: 'Imagen de la clase',
    })
    imagen: any;

    @ApiProperty({ description: "ID de la categoría", required: false })
    @IsUUID()
    @IsNotEmpty()
    categoriaId?: string;

    @ApiProperty({ description: "ID del profesor", required: false })
    @IsUUID()
    @IsNotEmpty()
    perfilProfesorId?: string;


    // estado: boolean

}

function IsOptional(): (target: ModificarClaseDto, propertyKey: "imagen") => void {
    throw new Error("Function not implemented.");
}

