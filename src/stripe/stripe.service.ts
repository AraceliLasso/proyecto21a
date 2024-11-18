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

  async createCheckoutSession() {
    try {
      const session = await this.stripe.checkout.sessions.create({
        line_items: [{ price: 'price_1Q3nA6EOWMdQIKjLxPXKLLTq', quantity: 2 }],
        mode: 'payment',
        payment_intent_data: {
          setup_future_usage: 'on_session',
        },
        customer: 'cus_QvNkGbXdVWIqY9',
        success_url:
          'http://localhost:3000/stripe/pay/success/checkout/session?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3000/pay/failed/checkout/session',
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

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
