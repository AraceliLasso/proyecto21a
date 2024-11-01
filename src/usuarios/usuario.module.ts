import { Module } from "@nestjs/common";
import { Usuario } from "./usuario.entity";
import { TypeOrmModule } from "@nestjs/typeorm";





@Module({
    imports: [TypeOrmModule.forFeature([Usuario])],
    // providers: [ UsuarioService, MailService],
    // controllers: [UsuarioController],
    // exports: [UsuarioService]
})
export class UsuarioModulo{}