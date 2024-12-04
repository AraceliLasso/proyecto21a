import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

import { IsBoolean, ValidateIf,IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class ActualizarUsuarioDto {
    @ApiProperty({
        type: String,
        description: "El nombre del usuario",
        required: false,
    })
    @ValidateIf((obj) => obj.nombre !== undefined && obj.nombre !== null && obj.nombre !== '')
    @IsOptional()
    @IsString()
    @MaxLength(80)
    @MinLength(3)
    nombre?: string;

    @ApiProperty({
        type: Number,
        description: "La edad del usuario",
        required: false,
    })
    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    edad?: number;

    @ApiProperty({
        type: Number,
        description: "El número de teléfono del usuario",
        required: false,
    })
    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    telefono?: number;

    @ApiPropertyOptional({
        type: String,
        description: "El correo electrónico del usuario",
        required: false,
    })
    @ValidateIf((obj) => obj.email !== undefined && obj.email !== null && obj.email !== '') // Solo valida si email está presente
    @IsOptional()
    @IsEmail({}, { message: "El correo electrónico no tiene un formato válido" })
    email?: string;

    @ApiPropertyOptional({
        type: String,
        description: "La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número y un carácter especial (!@#$%^&*)",
        required: false,
    })
    @ValidateIf((obj) => obj.contrasena !== undefined && obj.contrasena !== null && obj.contrasena !== '') // Solo valida si contrasena está presente
    @IsOptional()
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[=!@#$%^&*])[A-Za-z\d=!@#$%^&*]{8,15}$/,
        {
            message: "La contraseña debe contener al menos una letra minúscula, una letra mayúscula, un número y un carácter especial (!@#$%^&*)"
        }
    )
    @IsString()
    contrasena?: string;


    @ApiPropertyOptional({
        type: 'string',
        format: 'binary', 
        description: 'Imagen del usuario',
        required: false,
    })
    @IsOptional()
    imagen?: any;

}
