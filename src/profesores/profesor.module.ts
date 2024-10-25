import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Profesores } from "./profesor.entity";





@Module({
    imports: [TypeOrmModule.forFeature([Profesores])],
    // providers: [],
    // controllers: [],
    // exports: []
})
export class ProfesoresModule{}