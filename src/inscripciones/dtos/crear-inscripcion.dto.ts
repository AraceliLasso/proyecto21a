import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class CrearInscripcionDto{
    @ApiProperty({ description: 'ID del usuario que se inscribe' })
    @IsUUID()
    usuarioId: string;
    @ApiProperty({ description: 'ID de la clase donde el usuario desea inscribirse' })
    @IsUUID()
    claseId: string;
}