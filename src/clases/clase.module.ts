import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Clases } from "./clase.entity";
import { Profesores } from "src/profesores/profesor.entity";
import { Categorias } from "src/categorias/categories.entity";





@Module({
    imports: [TypeOrmModule.forFeature([Clases, Profesores, Categorias])],
    // providers: [],
    // controllers: [],
    // exports: []
})
export class ClasesModule{}