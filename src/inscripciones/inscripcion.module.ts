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
import { ClasesService } from "src/clases/clase.service";
import { Categoria } from "src/categorias/categories.entity";
import { UsuarioModule } from "src/usuarios/usuario.module";
import { CategoriesService } from "src/categorias/categories.service";
import { PerfilProfesor } from "src/perfilesProfesores/perfilProfesor.entity";
import { PerfilesProfesoresService } from "src/perfilesProfesores/perfilProfesor.service";

@Module({
    imports: [
      TypeOrmModule.forFeature([Inscripcion, Usuario, Clase, Membresia, Categoria, PerfilProfesor]),
      UsuarioModule
    ],
    controllers: [InscripcionController],
    providers: [InscripcionesService, UsuariosService, MembresiaService, ClasesService, CategoriesService, PerfilesProfesoresService],
  })
  export class InscripcionModule {}