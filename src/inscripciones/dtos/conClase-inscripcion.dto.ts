import { ApiProperty } from '@nestjs/swagger';
import { Clase } from 'src/clases/clase.entity';
import { PerfilProfesor } from 'src/perfilesProfesores/perfilProfesor.entity';

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
