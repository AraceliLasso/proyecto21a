import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class ModificarEstadoMembresiaDto {
    @ApiProperty({
        description: 'Indica si la membresia está habilitada (true) o deshabilitada (false)',
        example: true, 
    })
    @IsBoolean()
    activa: boolean;
}