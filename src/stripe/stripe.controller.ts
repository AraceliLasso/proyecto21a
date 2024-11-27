import { Controller, Post, Body, Headers } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Stripe } from 'stripe';

@ApiTags('Pagos')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Receive Stripe Webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook received' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async handleWebhook(
    @Body() payload: string, // Recibimos el payload como un string
    @Headers('stripe-signature') sigHeader: string, // La firma para validar el webhook
  ) {
    try {
      // Verifica y construye el evento
      const event = this.stripeService.constructEvent(sigHeader, payload);
      console.log('Received event:', event);

      // Procesar el evento según el tipo de evento
      switch (event.type) {
        case 'checkout.session.completed':
          // Lógica cuando la sesión de pago se completa
          const session = event.data.object; // Obtén la información de la sesión
          console.log('Payment for session completed:', session);
          break;

        case 'account.external_account.created':
          // Lógica para cuando se cree una cuenta externa
          console.log('External account created:', event.data.object);
          break;

        case 'account.external_account.deleted':
          // Lógica para cuando se elimine una cuenta externa
          console.log('External account deleted:', event.data.object);
          break;

        case 'account.external_account.updated':
          // Lógica para cuando se actualice una cuenta externa
          console.log('External account updated:', event.data.object);
          break;

        case 'account.updated':
          // Lógica para cuando se actualice la cuenta
          console.log('Account updated:', event.data.object);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { message: 'Webhook received successfully' };
    } catch (error) {
      console.error('Error processing webhook event:', error);
      return { message: 'Webhook processing failed', error: error.message };
    }
  }
  @Post('checkout')
  @ApiOperation({ summary: 'Create a Stripe Checkout session' })
  @ApiResponse({ status: 200, description: 'Checkout session created' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createCheckoutSession(membresiaId: string, precio: number, email: string) {
    try {
      // Aquí le pasamos los tres parámetros al método
      const session = await this.stripeService.crearSesionDePago(membresiaId, precio, email);
      return { sessionId: session.id }; // Regresamos el ID de la sesión de Stripe al frontend
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }
}
