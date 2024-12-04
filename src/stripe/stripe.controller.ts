import { Controller, Post, Body, Headers } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiHeader } from '@nestjs/swagger';
import { Stripe } from 'stripe';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Receive Stripe Webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook received successfully' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe webhook signature header',
    required: true,
  })
  @ApiBody({
    description: 'Raw payload from Stripe webhook',
    type: String,
  })
  async handleWebhook(
    @Body() payload: string, // Recibimos el payload como un string
    @Headers('stripe-signature') sigHeader: string, // La firma para validar el webhook
  ) {
    try {
      const event = this.stripeService.constructEvent(sigHeader, payload);
      console.log('Received event:', event);

      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object; 
          console.log('Payment for session completed:', session);
          break;

        case 'account.external_account.created':
          console.log('External account created:', event.data.object);
          break;

        case 'account.external_account.deleted':
          console.log('External account deleted:', event.data.object);
          break;

        case 'account.external_account.updated':
          console.log('External account updated:', event.data.object);
          break;

        case 'account.updated':
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
  @ApiResponse({ status: 200, description: 'Checkout session created', schema: { example: { sessionId: 'cs_test_12345' } } })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @ApiBody({
    description: 'Parameters to create a Checkout session',
    schema: {
      type: 'object',
      properties: {
        membresiaId: { type: 'string', example: 'membresia_123' },
        precio: { type: 'number', example: 2000 },
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  async createCheckoutSession(
    @Body('membresiaId') membresiaId: string,
    @Body('precio') precio: number,
    @Body('email') email: string,
  ) {
    try {
      const session = await this.stripeService.crearSesionDePago(membresiaId, precio, email);
      return { sessionId: session.id };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }
}
