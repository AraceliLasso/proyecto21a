import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { Payment } from './payment.entity'; // Importa la entidad Payment
import Stripe from 'stripe';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]), // Registra la entidad Payment
  ],
  controllers: [StripeController], // Agrega el controlador aquí
  providers: [
    StripeService, // Agrega el servicio aquí
    {
      provide: 'STRIPE_CLIENT',
      useFactory: () => {
        return new Stripe(process.env.STRIPE_API_KEY, {
          apiVersion: '2024-10-28.acacia', // Versión actualizada de la API
        });
      },
    },
  ],
  exports: [
    StripeService, // Exporta el servicio si lo necesitas en otros módulos
    'STRIPE_CLIENT',
  ],
})
export class StripeModule {}
