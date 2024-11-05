import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Categoria } from "./categories.entity";
import { Clase } from "src/clases/clase.entity";





@Module({
    imports: [TypeOrmModule.forFeature([Categoria, Clase])],
    // providers: [],
    // controllers: [],
    // exports: []
})
export class CategoriasModule{}