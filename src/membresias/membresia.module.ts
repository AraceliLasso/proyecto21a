import { TypeOrmModule } from "@nestjs/typeorm";
import { MembresiaController } from "./membresia.controller";
import { MembresiaService } from "./membresia.service";
import { Module } from "@nestjs/common";
import { Membresia } from "./membresia.entity";
import { Usuario } from "src/usuarios/usuario.entity";
import { UsuariosService } from "src/usuarios/usuario.service";
import { UsuarioModule } from "src/usuarios/usuario.module";
import { StripeService } from "src/stripe/stripe.service";
import { CloudinaryService } from "src/file-upload/cloudinary.service";

@Module({
    imports: [
      TypeOrmModule.forFeature([Membresia, Usuario]),  // Asegúrate de que la entidad Membresia esté incluida
      UsuarioModule,  // Importa UsuarioModule para tener acceso a UsuariosService
    ],
    controllers: [MembresiaController],
    providers: [MembresiaService, UsuariosService, StripeService, CloudinaryService],
    exports: [MembresiaService],
  })
  export class MembresiaModule {}