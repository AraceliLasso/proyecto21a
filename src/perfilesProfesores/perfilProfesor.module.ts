import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Clase } from "src/clases/clase.entity";
import { PerfilProfesor } from "./perfilProfesor.entity";
import { PerfilesProfesoresService } from "./perfilProfesor.service";
import { PerfilesProfesoresController } from "./perfilProfesor.controller";
import { UsuariosService } from "src/usuarios/usuario.service";
import { UsuarioModule } from "src/usuarios/usuario.module";
import { Usuario } from "src/usuarios/usuario.entity";
import { FileUploadService } from "src/file-upload/file-upload.service";
import { CloudinaryService } from "src/file-upload/cloudinary.service";
import { ClasesService } from "src/clases/clase.service";
import { CategoriesService } from "src/categorias/categories.service";
import { Categoria } from "src/categorias/categories.entity";





@Module({
    imports: [TypeOrmModule.forFeature([PerfilProfesor, Clase, Usuario, Categoria]),
    UsuarioModule
    ],
    providers: [PerfilesProfesoresService, UsuariosService, FileUploadService, CloudinaryService, ClasesService, CategoriesService],
    controllers: [PerfilesProfesoresController],
    exports: [PerfilesProfesoresService, TypeOrmModule]
})
export class PerfilesProfesoresModule{}