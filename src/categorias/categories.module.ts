import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Categoria } from "./categories.entity";
import { Clase } from "src/clases/clase.entity";
import { CategoriesService } from "./categories.service";
import { CategoriesController } from "./categories.controller";
import { CloudinaryService } from "src/file-upload/cloudinary.service";
import { FileUploadService } from "src/file-upload/file-upload.service";
import { ClasesService } from "src/clases/clase.service";
import { UsuariosService } from "src/usuarios/usuario.service";
import { PerfilesProfesoresService } from "src/perfilesProfesores/perfilProfesor.service";
import { PerfilProfesor } from "src/perfilesProfesores/perfilProfesor.entity";
import { Usuario } from "src/usuarios/usuario.entity";





@Module({
    imports: [TypeOrmModule.forFeature([Categoria, Clase, PerfilProfesor, Usuario])],
    providers: [CategoriesService, CloudinaryService, FileUploadService, ClasesService, UsuariosService, PerfilesProfesoresService],
    controllers: [CategoriesController],
    exports: [CategoriesService, TypeOrmModule]
})
export class CategoriasModule{}