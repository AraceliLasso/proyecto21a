import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Membresia } from "src/membresias/membresia.entity";

export class UsuarioAdminDto {

    @ApiProperty({
        type: String,
        description: "El identificador único del usuario",
        required: true,
    })
    @IsNotEmpty()
    @IsString()  // O @IsNumber() si es un número
    id: string;  // O id: number; dependiendo de cómo esté definido en tu base de datos

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
    @IsNotEmpty()
    @IsString()
    email: string;

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


    // @ApiProperty({
    //     type: Boolean,
    //     description: "Indica si el usuario tiene permisos de administrador",
    //     required: true,
    // })
    // @IsBoolean()
    // admin: boolean;

    @ApiProperty({
        type: String,
        description: "El rol del usuario",
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    rol: string; 

    @ApiProperty({
        description: 'Indica si el usuario está habilitado (true) o deshabilitado (false)',
        example: true, 
    })
    @IsBoolean()
    estado: boolean;


    @ApiProperty({
        type: () => Membresia, 
        description: "La membresía asociada al usuario",
        required: false,
    })
    membresia?: {
        id: string;
        nombre: string;
        descripcion: string;
        features:string [],
        precio: number;
        duracionEnMeses: number;
        fechaCreacion: Date;
        fechaExpiracion: Date;
        fechaActualizacion: Date,
        activa: boolean;
    } | null; 
}
