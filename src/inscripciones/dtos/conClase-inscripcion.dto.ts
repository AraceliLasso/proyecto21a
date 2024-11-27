import { ApiProperty } from '@nestjs/swagger';
import { Clase } from 'src/clases/clase.entity';

export class InscripcionConClaseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    fechaInscripcion: Date;

    @ApiProperty()
    fechaVencimiento: Date;

    @ApiProperty()
    estado: string;

    @ApiProperty()
    clase: Clase;
}
