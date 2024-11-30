import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { rolEnum } from "../usuario.entity";

export class ModificarRolDto {
    @ApiProperty({
        description: 'Modificar el rol del usuario de cliente a profesor o admin',
        example: 'profesor', 
    })
    @IsEnum(rolEnum, { message: "El rol debe ser uno de los valores permitidos: cliente, profesor, admin" })
    rol: rolEnum;
}