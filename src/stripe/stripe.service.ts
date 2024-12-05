import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity'; // Asegúrate de que la entidad Payment esté bien definida

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {
    this.stripe = new Stripe('sk_test_51Q3WnSEOWMdQIKjLTMnXWPdy735mGH7gGz54TH4yZuJObQ0J24uieq9BFeQcgETgAMBIzWdsTkODuxv60zbjlCss00ok15nX81', {
      apiVersion: '2024-10-28.acacia',
    });
  }

  /**
   * Verifica y construye el evento del webhook con la firma de Stripe.
   */
  constructEvent(signature: string, payload: string): Stripe.Event {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    try {
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
  async createCheckoutSession(membresiaId: string, precio: number, email: string) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Membresía ${membresiaId}`,
              },
              unit_amount: precio * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        payment_intent_data: {
          setup_future_usage: 'on_session',
        },
        customer_email: email,
        success_url: `https://pf-webgym-qv6r.vercel.app/stripe/pay/success/checkout/session?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: 'https://pf-webgym-qv6r.vercel.app/pay/failed/checkout/session',
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Procesa el pago exitoso y guarda los datos en la base de datos.
   */
  async processSuccessfulPayment(session: Stripe.Checkout.Session) {
    try {
      // Datos a guardar en la base de datos
      const paymentData = {
        sessionId: session.id,           // ID de la sesión de Stripe
        amount: session.amount_total / 100, // Convertir de centavos a la moneda principal
        status: 'completed',             // Estado del pago
        userEmail: session.customer_email, // Email del cliente
        membershipId: session.metadata.membresiaId, // ID de la membresía adquirida (puede estar en metadata)
        date: new Date(),                // Fecha del pago
      };

      // Guardamos el pago en la base de datos
      const payment = this.paymentRepository.create(paymentData);
      await this.paymentRepository.save(payment);

      console.log('Pago guardado exitosamente:', payment.id);
      return payment; // Retorna el pago guardado
    } catch (error) {
      console.error('Error al guardar el pago:', error);
      throw new Error('Error al guardar el pago en la base de datos');
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
