import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe('sk_test_51Q3WnSEOWMdQIKjLTMnXWPdy735mGH7gGz54TH4yZuJObQ0J24uieq9BFeQcgETgAMBIzWdsTkODuxv60zbjlCss00ok15nX81', {
      apiVersion: '2024-10-28.acacia', // Verifica la versión de la API en tu cuenta de Stripe
    });
  }

  /**
   * Verifica y construye el evento del webhook con la firma de Stripe.
   */
  constructEvent(signature: string, payload: string): Stripe.Event {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    try {
      // Usamos constructEvent para verificar la firma y procesar el payload
      const event = this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
      return event;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      throw new Error('Webhook signature verification failed');
    }
  }

  /**
   * Crea una nueva sesión de pago en Stripe.
   */
  async createCheckoutSession() {
    try {
      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price: 'price_1Q3nA6EOWMdQIKjLxPXKLLTq', // Reemplaza con tu precio de producto
            quantity: 2, // Define la cantidad del producto
          },
        ],
        mode: 'payment',
        payment_intent_data: {
          setup_future_usage: 'on_session',
        },
        customer: 'cus_QvNkGbXdVWIqY9', // Reemplaza con el ID del cliente
        success_url: 'http://localhost:3000/stripe/pay/success/checkout/session?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3000/pay/failed/checkout/session',
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Recupera la sesión de pago después de que se haya completado el pago exitosamente.
   */
  async successSession(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      console.log('Checkout session:', session);
      return { message: 'Payment successful', session };
    } catch (error) {
      console.error('Error retrieving session:', error);
      throw new Error('Failed to retrieve session');
    }
  }
}
