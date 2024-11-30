import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Clase } from "./clase.entity";
import { Categoria } from "src/categorias/categories.entity";
import { PerfilProfesor } from "src/perfilesProfesores/perfilProfesor.entity";
import { ClasesService } from "./clase.service";
import { ClasesController } from "./clase.controller";
import { CategoriasModule } from "src/categorias/categories.module";
import { CloudinaryService } from "src/file-upload/cloudinary.service";
import { Usuario } from "src/usuarios/usuario.entity";
import { FileUploadModule } from "src/file-upload/file-upload.module";
import { CategoriesService } from "src/categorias/categories.service";
import { UsuariosService } from "src/usuarios/usuario.service";
import { PerfilesProfesoresService } from "src/perfilesProfesores/perfilProfesor.service";
import { Inscripcion } from "src/inscripciones/inscripcion.entity";
import { InscripcionModule } from "src/inscripciones/inscripcion.module";
import { InscripcionesService } from "src/inscripciones/inscripcion.service";
import { FileUploadService } from "src/file-upload/file-upload.service";





@Module({
    imports: [TypeOrmModule.forFeature([Clase, PerfilProfesor, Inscripcion, Categoria]),
    InscripcionModule
],
    providers: [ClasesService, CategoriesService, UsuariosService, CloudinaryService, FileUploadService, PerfilesProfesoresService],
    controllers: [ClasesController],
    exports: [ClasesService, TypeOrmModule]
})
export class ClasesModule{}