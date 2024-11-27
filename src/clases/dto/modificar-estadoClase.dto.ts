import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class ModificarEstadoDto {
    @ApiProperty({
        description: 'Indica si la clase está habilitada (true) o deshabilitada (false)',
        example: true, 
    })
    @IsBoolean()
    estado: boolean;
}