import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Profesores } from "./profesor.entity";
import { Clase } from "src/clases/clase.entity";





@Module({
    imports: [TypeOrmModule.forFeature([Profesores, Clase])],
    // providers: [],
    // controllers: [],
    // exports: []
})
export class ProfesoresModule{}