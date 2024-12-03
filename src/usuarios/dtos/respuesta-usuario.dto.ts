import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { Inscripcion } from "src/inscripciones/inscripcion.entity";
import { Membresia } from "src/membresias/membresia.entity";

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
        type: Number,
        description: "La edad del usuario",
        required: true,
    })
    @IsNumber()
    edad: number;

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

    @ApiProperty({
        type: () => Membresia, 
        description: "La membresía asociada al usuario",
        required: false,
    })
    membresia?: Membresia;

    @ApiProperty({
        type: () => [Inscripcion], 
        description: "Las inscripciones asociadas al usuario",
        required: false,
    })
    inscripciones?: Inscripcion[];



    constructor(partial: Partial<UsuarioRespuestaDto>) { // Esto permite que el constructor acepte menos propiedades de las declaradas, por ejemplo, password
        const { nombre, edad, email, telefono, imagen , membresia, inscripciones} = partial;
        this.nombre = nombre;
        this.edad = edad;
        this.email = email;
        this.telefono = telefono;
        this.imagen = imagen;
        this.membresia = membresia;
        this.inscripciones = inscripciones;
        

    }
}
