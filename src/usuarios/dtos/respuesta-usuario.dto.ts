import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export default class UsuarioRespuestaDto {
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
        type: String,
        description: "La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número y un carácter especial (!@#$%^&*)",
        required: true,
    })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[=!@#$%^&*])[A-Za-z\d=!@#$%^&*]{8,15}$/,
        {
            message: "La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número y un carácter especial (!@#$%^&*)"
        }
    )
    @IsString()
    contrasena: string;

    @ApiProperty({
        type: String,
        description: "La edad del usuario",
        required: true,
    })
    @IsString()
    edad: string;

    @ApiProperty({
        type: String,
        description: "El número de teléfono del usuario",
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    telefono: string;


    constructor(partial: Partial<UsuarioRespuestaDto>) { // Esto permite que el constructor acepte menos propiedades de las declaradas, por ejemplo, password
        const { nombre, edad, email, telefono } = partial;
        this.nombre = nombre;
        this.edad = edad;
        this.email = email;
        this.telefono = telefono;
    }
}
