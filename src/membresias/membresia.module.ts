import { TypeOrmModule } from "@nestjs/typeorm";
import { MembresiaController } from "./membresia.controller";
import { MembresiaService } from "./membresia.service";
import { Module } from "@nestjs/common";
import { Membresia } from "./membresia.entity";
import { Usuario } from "src/usuarios/usuario.entity";
import { UsuariosService } from "src/usuarios/usuario.service";
import { UsuarioModule } from "src/usuarios/usuario.module";

@Module({
    imports: [
      TypeOrmModule.forFeature([Membresia]),  // Asegúrate de que la entidad Membresia esté incluida
      UsuarioModule,  // Importa UsuarioModule para tener acceso a UsuariosService
    ],
    controllers: [MembresiaController],
    providers: [MembresiaService],
    exports: [MembresiaService],
  })
  export class MembresiaModule {}