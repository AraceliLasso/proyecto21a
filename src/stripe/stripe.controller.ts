import { Controller, Post, Body, Headers } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Stripe } from 'stripe';

@ApiTags('Pagos')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  // @Post('webhook')
  // @ApiOperation({ summary: 'Receive Stripe Webhook events' })
  // @ApiResponse({ status: 200, description: 'Webhook received' })
  // @ApiResponse({ status: 500, description: 'Internal Server Error' })
  // async handleWebhook(
  //   @Body() payload: string, // Recibimos el payload como un string
  //   @Headers('stripe-signature') sigHeader: string, // La firma para validar el webhook
  // ) {
  //   try {
  //     // Verifica y construye el evento
  //     const event = this.stripeService.constructEvent(sigHeader, payload);
  //     console.log('Received event:', event);

  //     // Procesar el evento según el tipo de evento
  //     switch (event.type) {
  //       case 'checkout.session.completed':
  //         // Lógica cuando la sesión de pago se completa
  //         const session = event.data.object; // Obtén la información de la sesión
  //         console.log('Payment for session completed:', session);
  //         break;

  //       case 'account.external_account.created':
  //         // Lógica para cuando se cree una cuenta externa
  //         console.log('External account created:', event.data.object);
  //         break;

  //       case 'account.external_account.deleted':
  //         // Lógica para cuando se elimine una cuenta externa
  //         console.log('External account deleted:', event.data.object);
  //         break;

  //       case 'account.external_account.updated':
  //         // Lógica para cuando se actualice una cuenta externa
  //         console.log('External account updated:', event.data.object);
  //         break;

  //       case 'account.updated':
  //         // Lógica para cuando se actualice la cuenta
  //         console.log('Account updated:', event.data.object);
  //         break;

  //       default:
  //         console.log(`Unhandled event type: ${event.type}`);
  //     }

  //     return { message: 'Webhook received successfully' };
  //   } catch (error) {
  //     console.error('Error processing webhook event:', error);
  //     return { message: 'Webhook processing failed', error: error.message };
  //   }
  // }

  @Post('webhook')
@ApiOperation({ summary: 'Receive Stripe Webhook events' })
@ApiResponse({ status: 200, description: 'Webhook received successfully' })
@ApiResponse({ status: 500, description: 'Internal Server Error' })
async handleWebhook(
  @Body() payload: string,
  @Headers('stripe-signature') sigHeader: string,
) {
  try {
    // Verifica y construye el evento usando el servicio de Stripe
    const event = this.stripeService.constructEvent(sigHeader, payload);
    console.log('Webhook event received:', event);

    // Procesa los diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Payment completed for session:', session.id);

        // Procesa el pago, por ejemplo, actualizando la base de datos.
        // Aquí NO se debe modificar la sesión del usuario.
        await this.processSuccessfulPayment(session);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Responde con 200 OK si todo salió bien
    return { message: 'Webhook received successfully' };
  } catch (error) {
    console.error('Error processing webhook event:', error);

    // Devuelve un error con un código 500 si ocurrió un problema
    return { message: 'Webhook processing failed', error: error.message };
  }
}

/**
 * Lógica para procesar un pago exitoso.
 */
private async processSuccessfulPayment(session: Stripe.Checkout.Session) {
  // Ejemplo de procesamiento:
  // 1. Actualizar la base de datos para marcar el pago como completado
  // 2. Enviar un correo electrónico de confirmación al usuario
  console.log(`Processing successful payment for session: ${session.id}`);
  
  // Tu lógica de base de datos aquí:
  // await this.paymentService.updatePaymentStatus(session.id, 'completed');
}
  @Post('checkout')
  @ApiOperation({ summary: 'Create a Stripe Checkout session' })
  @ApiResponse({ status: 200, description: 'Checkout session created' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createCheckoutSession(
    @Body() createSessionDto: { membresiaId: string; precio: number; email: string } // Recibimos los datos del body
  ) {
    try {
      const { membresiaId, precio, email } = createSessionDto; // Desestructuramos los datos
      const session = await this.stripeService.createCheckoutSession(
        membresiaId,
        precio,
        email,
      );
      return { sessionId: session.id }; // Regresamos solo el ID de la sesión de Stripe al frontend
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

}
