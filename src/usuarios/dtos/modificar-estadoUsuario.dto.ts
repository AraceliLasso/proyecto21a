import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class ModificarEstadoDto {
    @ApiProperty({
        description: 'Indica si el usuario está habilitado (true) o deshabilitado (false)',
        example: true, 
    })
    @IsBoolean()
    estado: boolean;
}