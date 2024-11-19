import { ApiProperty } from "@nestjs/swagger";
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

    @ApiProperty({ description: 'Fecha y hora de la cita en formato ISO', example: '2024-10-10T14:00:00Z', required: true })
    @IsNotEmpty()
    fecha: Date;

    @ApiProperty({ description: "La disponibilidad de clases", required: true })
    @IsNumber()
    @IsNotEmpty()
    disponibilidad: number;

    @ApiProperty({ description: "URL de la imagen de la clase",  })
    @IsString()
    ///@IsOptional()
    imagen?: string;

    @ApiProperty({ description: "ID de la categoría", required: true })
    @IsUUID()
    @IsNotEmpty()
    categoriaId: string;

    @ApiProperty({ description: "ID del profesor", required: true })
    @IsUUID()
    @IsNotEmpty()
    perfilProfesorId: string;

}

function IsOptional(): (target: ModificarClaseDto, propertyKey: "imagen") => void {
    throw new Error("Function not implemented.");
}

