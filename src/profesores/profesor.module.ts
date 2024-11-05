import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PerfilProfesor } from "./profesor.entity";
import { Clase } from "src/clases/clase.entity";





@Module({
    imports: [TypeOrmModule.forFeature([PerfilProfesor, Clase])],
    // providers: [],
    // controllers: [],
    // exports: []
})
export class ProfesoresModule{}