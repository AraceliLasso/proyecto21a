import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Clase } from "src/clases/clase.entity";
import { PerfilProfesor } from "./perfilProfesor.entity";
import { PerfilesProfesoresService } from "./perfilProfesor.service";
import { PerfilesProfesoresController } from "./perfilProfesor.controller";
import { UsuariosService } from "src/usuarios/usuario.service";
import { UsuarioModule } from "src/usuarios/usuario.module";
import { Usuario } from "src/usuarios/usuario.entity";





@Module({
    imports: [TypeOrmModule.forFeature([PerfilProfesor, Clase, Usuario]),
    UsuarioModule
    ],
    providers: [PerfilesProfesoresService, UsuariosService],
    controllers: [PerfilesProfesoresController],
    exports: [PerfilesProfesoresService, TypeOrmModule]
})
export class PerfilesProfesoresModule{}