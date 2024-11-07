import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Clase } from "./clase.entity";
import { Categoria } from "src/categorias/categories.entity";
import { PerfilProfesor } from "src/perfilesProfesores/perfilProfesor.entity";





@Module({
    imports: [TypeOrmModule.forFeature([Clase, PerfilProfesor, Categoria])],
    // providers: [],
    // controllers: [],
    // exports: []
})
export class ClasesModule{}