import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { CloudinaryService } from './cloudinary.service';
import { ClasesService } from 'src/clases/clase.service';
import { UsuariosService } from 'src/usuarios/usuario.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clase } from 'src/clases/clase.entity';
import { CategoriesService } from 'src/categorias/categories.service';
import { PerfilProfesor } from 'src/perfilesProfesores/perfilProfesor.entity';
import { Categoria } from 'src/categorias/categories.entity';
import { Usuario } from 'src/usuarios/usuario.entity';
import { ClasesController } from 'src/clases/clase.controller';
import { ClasesModule } from 'src/clases/clase.module';
import { PerfilesProfesoresService } from 'src/perfilesProfesores/perfilProfesor.service';



@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
   ClasesModule
  ],
  providers: [FileUploadService, ClasesService, UsuariosService, CloudinaryService, PerfilesProfesoresService, CategoriesService],
  controllers: [],
  exports: [FileUploadService,  CloudinaryService]
})

export class FileUploadModule {}
