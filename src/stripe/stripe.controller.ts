import { Controller, Get, Res, Query } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('Pagos')  // Categoría para el controlador
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Get('pay/success/checkout/session')
  @ApiOperation({ summary: 'Handle successful payment session' })
  @ApiQuery({ name: 'session_id', required: true, description: 'The session ID from Stripe' })
  @ApiResponse({ status: 200, description: 'Payment successful' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async paymentSuccess(@Res() res, @Query('session_id') sessionId: string) {
    console.log("Received session ID:", sessionId); // Log de ID de sesión
    try {
      const session = await this.stripeService.successSession(sessionId);
      console.log("Retrieved session:", session); // Log de sesión obtenida
      return res.json({ message: "Payment successful", session });
    } catch (error) {
      console.error("Error fetching session:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  }

  @Get('checkout-session')
  @ApiOperation({ summary: 'Create a new checkout session' })
  @ApiResponse({ status: 200, description: 'Checkout session created successfully' })
  async createCheckoutSession() {
    return this.stripeService.createCheckoutSession();
  }
}
