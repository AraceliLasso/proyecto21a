import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Categoria } from "./categories.entity";
import { Clase } from "src/clases/clase.entity";
import { CategoriesService } from "./categories.service";
import { CategoriesController } from "./categories.controller";





@Module({
    imports: [TypeOrmModule.forFeature([Categoria])],
    providers: [CategoriesService],
    controllers: [CategoriesController],
    exports: [CategoriesService, TypeOrmModule]
})
export class CategoriasModule{}