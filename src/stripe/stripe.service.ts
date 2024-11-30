import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
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
  async crearSesionDePago(membresiaId: string, precio: number, email: string) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'usd', // O la moneda que estés utilizando
              product_data: {
                name: `Membresía ${membresiaId}`, // Utiliza el ID o nombre de la membresía
              },
              unit_amount: precio * 100, // Stripe maneja los precios en centavos, por eso multiplicamos por 100
            },
            quantity: 1, // La cantidad del producto
          },
        ],
        mode: 'payment',
        payment_intent_data: {
          setup_future_usage: 'on_session',
        },
        customer_email: email, // Utiliza el correo del usuario
        success_url: `http://localhost:3000/stripe/pay/success/checkout/session?session_id={CHECKOUT_SESSION_ID}`,
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
  async crearFacturaSinCliente(email: string, items: { amount: number; currency: string; description: string }[]) {
    try {
      // Crea un cliente temporal utilizando el email
      const customer = await this.stripe.customers.create({
        email,
      });
  
      // Crea los elementos de la factura
      for (const item of items) {
        await this.stripe.invoiceItems.create({
          customer: customer.id,
          amount: item.amount, // En centavos
          currency: item.currency,
          description: item.description,
        });
      }
  
      // Crea la factura y la envía al cliente
      const invoice = await this.stripe.invoices.create({
        customer: customer.id,
        auto_advance: true, // Envía la factura automáticamente
      });
  
      // Retorna la factura creada
      return invoice;
    } catch (error) {
      console.error('Error al crear la factura:', error);
      throw new Error('No se pudo crear la factura');
    }
  }
}
