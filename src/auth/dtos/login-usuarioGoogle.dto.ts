import { ApiProperty } from '@nestjs/swagger';
import { IsString,IsEmail, IsNotEmpty, IsNumber, MaxLength, MinLength  } from 'class-validator';

export class LoginGoogleDto {
    @ApiProperty({ description: "El id del usuario registrado con Google", required: true })
    @IsString()
    id: string


    @ApiProperty({ description: "El nombre del usuario", required: true })
    @IsString()
    @IsNotEmpty()
    @MaxLength(80)
    @MinLength(3)
    nombre: string;

    @ApiProperty({ description: "El email del usuario", required: true })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: "El teléfono del usuario" })
    @IsNumber()
    telefono?: number;

    @ApiProperty({ description: "La edad del usuario" })
    @IsNumber()
    edad?: number;

    @ApiProperty({ description: "La contraseña del usuario" })
    @IsString()
    contrasena?: string;

    @ApiProperty({ description: "Confirmar contraseña del usuario" })
    @IsString()
    confirmarContrasena?: string;

}