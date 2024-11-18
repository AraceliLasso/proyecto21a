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





@Module({
    imports: [TypeOrmModule.forFeature([Clase, PerfilProfesor, Categoria, Usuario]), 
    CategoriasModule,
    FileUploadModule
],
    providers: [ClasesService, CategoriesService, UsuariosService],
    controllers: [ClasesController],
})
export class ClasesModule{}