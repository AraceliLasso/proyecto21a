// import { TypeOrmModule } from "@nestjs/typeorm";
// import { MembresiaController } from "./membresia.controller";
// import { MembresiaService } from "./membresia.service";
// import { Module } from "@nestjs/common";
// import { Membresia } from "./membresia.entity";
// import { Usuario } from "src/usuarios/usuario.entity";
// import { UsuariosService } from "src/usuarios/usuario.service";
// import { UsuarioModule } from "src/usuarios/usuario.module";
// import { StripeService } from "src/stripe/stripe.service";
// import { CloudinaryService } from "src/file-upload/cloudinary.service";
// import Stripemodule

// @Module({
//     imports: [
//       TypeOrmModule.forFeature([Membresia, Usuario]), 
//     ],
//     controllers: [MembresiaController],
//     providers: [MembresiaService, StripeService, UsuariosService, CloudinaryService],
//     exports: [MembresiaService],
//   })
//   export class MembresiaModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembresiaController } from './membresia.controller';
import { MembresiaService } from './membresia.service';
import { Membresia } from './membresia.entity';
import { Usuario } from 'src/usuarios/usuario.entity';
import { UsuariosService } from 'src/usuarios/usuario.service';
import { UsuarioModule } from 'src/usuarios/usuario.module';
import { StripeModule } from 'src/stripe/stripe.module'; // Importa el módulo Stripe
import { CloudinaryService } from 'src/file-upload/cloudinary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Membresia, Usuario]),
    StripeModule, // Importa el módulo Stripe para usar StripeService
  ],
  controllers: [MembresiaController],
  providers: [MembresiaService, UsuariosService, CloudinaryService],
  exports: [MembresiaService],
})
export class MembresiaModule {}
