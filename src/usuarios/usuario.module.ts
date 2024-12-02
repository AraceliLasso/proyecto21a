import { Module } from "@nestjs/common";
import { Usuario } from "./usuario.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsuariosService } from "./usuario.service";
import { MailService } from "src/notificaciones/mail.service";
import { UsuariosController } from "./usuario.controller";
import { CloudinaryService } from "src/file-upload/cloudinary.service";
import { FileUploadService } from "src/file-upload/file-upload.service";
import { ClasesService } from "src/clases/clase.service";
import { PerfilProfesor } from "src/perfilesProfesores/perfilProfesor.entity";
import { PerfilesProfesoresService } from "src/perfilesProfesores/perfilProfesor.service";
import { Clase } from "src/clases/clase.entity";
import { CategoriesService } from "src/categorias/categories.service";
import { Categoria } from "src/categorias/categories.entity";
import { InscripcionModule } from "src/inscripciones/inscripcion.module";





@Module({
    imports: [TypeOrmModule.forFeature([Usuario, Clase, PerfilProfesor, Categoria]), InscripcionModule],
    providers: [ UsuariosService, MailService, CloudinaryService, FileUploadService, ClasesService, PerfilesProfesoresService, CategoriesService],
    controllers: [UsuariosController],
    exports: [UsuariosService]
})
export class UsuarioModule{}