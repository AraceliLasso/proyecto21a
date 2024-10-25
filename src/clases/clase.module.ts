import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Clases } from "./clase.entity";





@Module({
    imports: [TypeOrmModule.forFeature([Clases])],
    // providers: [],
    // controllers: [],
    // exports: []
})
export class ClasesModule{}