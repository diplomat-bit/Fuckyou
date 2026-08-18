import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface PaywallProps {
  priceId: string;
  buttonText?: string;
  className?: string;
}

const Paywall: React.FC<PaywallProps> = ({ 
  priceId, 
  buttonText = "Unlock Access", 
  className = "" 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Call your backend proxy to create a Checkout Session
      // The backend should use the Stripe Secret Key securely
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: priceId,
        }),
      });

      const session = await response.json();

      if (session.error) {
        throw new Error(session.error);
      }

      // 2. Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to initialize");

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (err: any) {
      console.error("Paywall Error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
      >
        {isLoading ? 'Processing...' : buttonText}
      </button>
      
      {error && (
        <p className="text-red-400 text-sm mt-2 animate-in fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

export default Paywall;