import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Categorias } from "./categories.entity";





@Module({
    imports: [TypeOrmModule.forFeature([Categorias])],
    // providers: [],
    // controllers: [],
    // exports: []
})
export class CategoriasModule{}