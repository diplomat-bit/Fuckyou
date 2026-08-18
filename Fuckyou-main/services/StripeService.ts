import { loadStripe } from '@stripe/stripe-js';

let stripePromiseCache: Promise<any> | null = null;

function getStripePromise() {
  if (!stripePromiseCache) {
    const key = typeof process !== 'undefined' ? process.env?.VITE_STRIPE_PUBLISHABLE_KEY : undefined;
    if (key) {
      stripePromiseCache = loadStripe(key).catch(err => {
        console.warn("Stripe.js failed to load:", err);
        return null;
      });
    } else {
      stripePromiseCache = Promise.resolve(null);
    }
  }
  return stripePromiseCache;
}

export class SovereignStripeService {
  static async createIntent(amount: number, currency: string = 'usd') {
    return { id: `pi_mock_${Date.now()}`, client_secret: `pi_mock_secret_${Date.now()}`, amount, currency };
  }

  static async initiatePayment(amount: number, description: string) {
    return stripeService.initiatePayment(amount, description);
  }

  static async createCheckoutSession(amount: number, description: string) {
    return stripeService.initiatePayment(amount, description);
  }
}

export const stripeService = {
  async initiatePayment(amount: number, description: string) {
    const response = await fetch('/api/v1/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, description }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    if (data.url) {
      window.location.href = data.url;
      return;
    }

    if (data.id) {
      const stripe = await getStripePromise();
      if (stripe) {
        await (stripe as any).redirectToCheckout({ sessionId: data.id });
      }
    }
  },
  async createIntent(amount: number, currency: string = 'usd') {
    return SovereignStripeService.createIntent(amount, currency);
  }
};

export const StripeService = SovereignStripeService;
export default SovereignStripeService;
