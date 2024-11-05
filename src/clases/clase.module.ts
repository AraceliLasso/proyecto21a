import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Clase } from "./clase.entity";
import { PerfilProfesor } from "src/profesores/profesor.entity";
import { Categoria } from "src/categorias/categories.entity";





@Module({
    imports: [TypeOrmModule.forFeature([Clase, PerfilProfesor, Categoria])],
    // providers: [],
    // controllers: [],
    // exports: []
})
export class ClasesModule{}