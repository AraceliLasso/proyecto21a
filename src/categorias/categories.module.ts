import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Categorias } from "./categories.entity";
import { Clases } from "src/clases/clase.entity";





@Module({
    imports: [TypeOrmModule.forFeature([Categorias, Clases])],
    // providers: [],
    // controllers: [],
    // exports: []
})
export class CategoriasModule{}