import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { Inscripcion } from "src/inscripciones/inscripcion.entity";
import { Membresia } from "src/membresias/membresia.entity";
import { Usuario } from "../usuario.entity";

export default class RespuestaUsuario2Dto {
    @ApiProperty({
        type: String,
        description: "El identificador único del usuario, asignado por la base de datos",
        required: true,
    })
    id: string;

    @ApiProperty({
        type: String,
        description: "El nombre del usuario",
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(80)
    @MinLength(3)
    nombre: string;

    @ApiProperty({
        type: String,
        description: "El correo electrónico del usuario",
        required: true,
    })
    @IsEmail()
    email: string;


    @ApiProperty({
        type: Number,
        description: "El número de teléfono del usuario",
        required: true,
    })
    @IsNotEmpty()
    @IsNumber()
    telefono: number;


    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'Imagen del usuario',
        required: false,
    })
    @IsOptional()
    imagen?: any;



    constructor(partial: Partial<RespuestaUsuario2Dto>) { // Esto permite que el constructor acepte menos propiedades de las declaradas, por ejemplo, password
        const { nombre, email, telefono, imagen } = partial;
        this.nombre = nombre;
        this.email = email;
        this.telefono = telefono;
        this.imagen = imagen;


    }
}
