import { PartialType } from '@nestjs/mapped-types';
import { CrearUsuarioDto } from './crear-usuario.dto';

export class ActualizarImagenUsuarioDto extends PartialType(CrearUsuarioDto) {
    imagen?: string;
}