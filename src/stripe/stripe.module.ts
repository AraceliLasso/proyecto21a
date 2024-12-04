import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller'; // Asegúrate de que el path sea correcto
import { StripeService } from './stripe.service';
import Stripe from 'stripe';

@Module({
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
  exports: ['STRIPE_CLIENT'],
})
export class StripeModule {}
