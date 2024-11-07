import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Clase } from "./clase.entity";
import { Categoria } from "src/categorias/categories.entity";
import { PerfilProfesor } from "src/perfilesProfesores/perfilProfesor.entity";
import { ClasesService } from "./clase.service";
import { ClasesController } from "./clase.controller";
import { CategoriasModule } from "src/categorias/categories.module";





@Module({
    imports: [TypeOrmModule.forFeature([Clase, PerfilProfesor, Categoria]), CategoriasModule],
    providers: [ClasesService],
    controllers: [ClasesController],
})
export class ClasesModule{}