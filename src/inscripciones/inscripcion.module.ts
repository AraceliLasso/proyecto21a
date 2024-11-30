import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Inscripcion } from "./inscripcion.entity";
import { Clase } from "src/clases/clase.entity";
import { Usuario } from "src/usuarios/usuario.entity";
import { Membresia } from "src/membresias/membresia.entity";
import { InscripcionController } from "./inscripcion.controller";
import { InscripcionesService } from "./inscripcion.service";
import { UsuariosService } from "src/usuarios/usuario.service";
import { MembresiaService } from "src/membresias/membresia.service";
import { UsuarioModule } from "src/usuarios/usuario.module";
import { FileUploadModule } from "src/file-upload/file-upload.module";
import { MembresiaModule } from "src/membresias/membresia.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Inscripcion, Usuario, Clase, Membresia]),
   MembresiaModule
  ],
  controllers: [InscripcionController],
  providers: [InscripcionesService, MembresiaService],
  exports: [InscripcionesService, TypeOrmModule]
  // Exporta el repositorio para que otros módulos lo usen
})

export class InscripcionModule { }