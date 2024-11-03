import { Module } from "@nestjs/common";
import { Usuario } from "./usuario.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsuariosService } from "./usuario.service";
import { MailService } from "src/notificaciones/mail.service";
import { UsuariosController } from "./usuario.controller";





@Module({
    imports: [TypeOrmModule.forFeature([Usuario])],
    providers: [ UsuariosService, MailService],
    controllers: [UsuariosController],
    exports: [UsuariosService]
})
export class UsuarioModule{}