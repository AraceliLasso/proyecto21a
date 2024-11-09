import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Clase } from "src/clases/clase.entity";
import { PerfilProfesor } from "./perfilProfesor.entity";





@Module({
    imports: [TypeOrmModule.forFeature([PerfilProfesor, Clase])],
    // providers: [],
    // controllers: [],
    // exports: []
})
export class PerfilesProfesoresModule{}