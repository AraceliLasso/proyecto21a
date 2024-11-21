import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Clase } from "src/clases/clase.entity";
import { PerfilProfesor } from "./perfilProfesor.entity";
import { PerfilesProfesoresService } from "./perfilProfesor.service";
import { PerfilesProfesoresController } from "./perfilProfesor.controller";





@Module({
    imports: [TypeOrmModule.forFeature([PerfilProfesor, Clase])],
    providers: [PerfilesProfesoresService],
    controllers: [PerfilesProfesoresController],
    exports: [PerfilesProfesoresService]
})
export class PerfilesProfesoresModule{}