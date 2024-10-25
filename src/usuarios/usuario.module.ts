import { Module } from "@nestjs/common";
import { Usuarios } from "./usuario.entity";
import { TypeOrmModule } from "@nestjs/typeorm";





@Module({
    imports: [TypeOrmModule.forFeature([Usuarios])],
    // providers: [ UsuariosService, MailService],
    // controllers: [UsuariosController],
    // exports: [UsuariosService]
})
export class UsuariosModule{}