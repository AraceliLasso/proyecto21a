import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";
import { RespuestaCategoriaDto } from "src/categorias/dto/respuesta-categoria.dto";
import { Clase } from "../clase.entity";
import { RespuestaPerfilProfesorDto } from "src/perfilesProfesores/dto/respuesta-perfilProfesor.dto";
import { plainToClass, Type } from "class-transformer";

export class RespuestaClaseDto {
    @ApiProperty({
        type: String,
        description: "El identificador único de la clase, asignado por la base de datos",
        required: true,
    })
    id: string;

    @ApiProperty({ description: "El nombre de la clase", required: true })
    nombre: string;

    @ApiProperty({ description: "La descripción de la clase", required: true })
    descripcion: string;

    @ApiProperty({ description: 'Fecha y hora de la clase en string', required: false })
    @IsString()
    fecha: string;

    @ApiProperty({ description: "La disponibilidad de clases", required: true })
    disponibilidad: number;

    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'Imagen de la clase',
    })
    imagen?: string;


    @ApiProperty({
        type: 'boolean',
        description: 'Estado de la clase',
    })
    @IsBoolean()
    estado?: boolean;

    @ApiProperty({
        type: () => RespuestaPerfilProfesorDto,
        description: "El perfil del profesor de la clase",
        required: false,
    })
    perfilProfesor?: RespuestaPerfilProfesorDto;

    @ApiProperty({
        type: () => RespuestaCategoriaDto,
        description: "La categoría del producto",
        required: false,
    })
    categoria?: RespuestaCategoriaDto;

    constructor(clase: Clase) {
        this.id = clase.id;
        this.nombre = clase.nombre;
        this.descripcion = clase.descripcion;
        this.fecha = clase.fecha;
        this.disponibilidad = clase.disponibilidad;
        this.imagen = clase.imagen || null;
        this.estado = clase.estado;
        console.log('Perfil Profesor antes de asignar:', clase.perfilProfesor);
        this.perfilProfesor = clase.perfilProfesor ? plainToClass(RespuestaPerfilProfesorDto, clase.perfilProfesor) : null;
        this.categoria = clase.categoria ? plainToClass(RespuestaCategoriaDto, clase.categoria) : null;
    }



}