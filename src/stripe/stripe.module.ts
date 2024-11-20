import { Module } from '@nestjs/common';
import Stripe from 'stripe';

@Module({
  providers: [
    {
      provide: 'STRIPE_CLIENT',
      useFactory: () => {
        return new Stripe(process.env.STRIPE_API_KEY, {
          apiVersion: '2024-10-28.acacia',
        });
      },
    },
  ],
  exports: ['STRIPE_CLIENT'],
})
export class StripeModule {}
