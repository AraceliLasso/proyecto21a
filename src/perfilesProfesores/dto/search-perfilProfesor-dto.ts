import { IsOptional, IsString } from 'class-validator';

export class SearchPerfilProfesorDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  certificacion?: string;
}
