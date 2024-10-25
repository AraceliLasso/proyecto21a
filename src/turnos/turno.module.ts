import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Turnos } from "./turno.entity";





@Module({
    imports: [TypeOrmModule.forFeature([Turnos])],
    // providers: [],
    // controllers: [],
    // exports: []
})
export class TurnosModule{}