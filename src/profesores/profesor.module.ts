import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Profesores } from "./profesor.entity";
import { Clases } from "src/clases/clase.entity";





@Module({
    imports: [TypeOrmModule.forFeature([Profesores, Clases])],
    // providers: [],
    // controllers: [],
    // exports: []
})
export class ProfesoresModule{}