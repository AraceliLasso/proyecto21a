import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class ActualizarUsuarioDto {
    @ApiProperty({
        type: String,
        description: "El nombre del usuario",
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(80)
    @MinLength(3)
    nombre?: string;

    @ApiProperty({
        type: Number,
        description: "La edad del usuario",
        required: true,
    })
    @IsNumber()
    @Type(() => Number)
    edad?: number;

    @ApiProperty({
        type: Number,
        description: "El número de teléfono del usuario",
        required: true,
    })
    @IsNumber()
    @Type(() => Number)
    telefono?: number;

    @ApiProperty({
        type: String,
        description: "El correo electrónico del usuario",
        required: true,
    })
    @IsEmail()
    email?: string;

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
    contrasena?: string;


    @ApiProperty({
        type: 'string',
        format: 'binary', 
        description: 'Imagen del usuario',
    })
    imagen?: any;

}
