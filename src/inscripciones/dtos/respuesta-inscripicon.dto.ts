import { ApiProperty } from "@nestjs/swagger";
import { RespuestaClaseDto } from "src/clases/dto/respuesta-clase.dto";
import { EstadoInscripcion } from "src/inscripciones/inscripcion.entity"; // Asegúrate de importar el enum
import RespuestaUsuario2Dto from "src/usuarios/dtos/respuestaDos-usuario.dto";

export class InscripcionRespuestaDto {
  @ApiProperty({ description: "Identificador único de la inscripción" })
  id: string;

  @ApiProperty({ description: "Fecha de la inscripción" })
  fechaInscripcion: Date;

  @ApiProperty({ description: "Fecha de vencimiento de la inscripción" })
  fechaVencimiento: Date;

  @ApiProperty({ enum: EstadoInscripcion, description: "Estado de la inscripción" })
  estado: EstadoInscripcion;

  @ApiProperty({ type: RespuestaClaseDto, description: "Clase asociada a la inscripción" })
  clase: RespuestaClaseDto;

  @ApiProperty({ type: RespuestaUsuario2Dto, description: "Usuario asociado a la inscripción" })
  usuario: RespuestaUsuario2Dto;

}
