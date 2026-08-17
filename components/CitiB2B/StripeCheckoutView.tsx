import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock_key');

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval?: 'month' | 'year';
  features: string[];
}

const mockProducts: Product[] = [
  {
    id: 'price_basic_b2b',
    name: 'B2B Basic Account Access',
    description: 'Retrieve basic account summaries and transaction histories for up to 5 client accounts.',
    price: 4900,
    currency: 'usd',
    interval: 'month',
    features: [
      'Access to Account Details API',
      'Up to 100 API requests per day',
      'Standard email support',
      'Basic transaction history (last 30 days)'
    ]
  },
  {
    id: 'price_premium_b2b',
    name: 'B2B Premium Integration',
    description: 'Full access to advanced account details, routing numbers, and unlimited transaction histories.',
    price: 19900,
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited Account Details & Transactions API',
      'Encrypted Account Routing Number access',
      'Up to 10,000 API requests per day',
      'Priority 24/7 support',
      'Full historical data access (up to 2 years)'
    ]
  },
  {
    id: 'price_enterprise_b2b',
    name: 'B2B Enterprise Custom',
    description: 'Custom API limits, dedicated support, and tailored integration for large financial institutions.',
    price: 99900,
    currency: 'usd',
    interval: 'month',
    features: [
      'Custom API rate limits',
      'Dedicated account manager',
      'SLA guarantees',
      'Custom webhook integrations',
      'On-premise deployment options'
    ]
  }
];

export const StripeCheckoutView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setProducts(mockProducts);
      } catch (err) {
        setError('Failed to load product catalog. Please try again later.');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleCheckout = async (priceId: string) => {
    try {
      setCheckoutLoadingId(priceId);
      setError(null);

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/citi-b2b/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/citi-b2b/cancel`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to initialize.');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during checkout.');
      console.error('Checkout error:', err);
    } finally {
      setCheckoutLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 font-medium">Loading product catalog...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Citi B2B API Integration Plans
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-3">
          Choose the right tier to access Citi customer account details, routing numbers, and transaction histories.
        </p>
      </div>

      {error && (
        <div className="mt-8 max-w-md mx-auto bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm text-center">
          {error}
        </div>
      )}

      <div className="mt-12 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white flex flex-col justify-between"
          >
            <div className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{product.name}</h3>
              <p className="mt-4 text-sm text-gray-500 min-h-[60px]">{product.description}</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">
                  ${(product.price / 100).toFixed(2)}
                </span>
                {product.interval && (
                  <span className="text-base font-medium text-gray-500">/{product.interval}</span>
                )}
              </p>
              <button
                onClick={() => handleCheckout(product.id)}
                disabled={checkoutLoadingId !== null}
                className={`mt-8 block w-full bg-blue-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                  checkoutLoadingId === product.id ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {checkoutLoadingId === product.id ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-xs font-medium text-gray-900 tracking-wide uppercase">
                What's included
              </h4>
              <ul className="mt-6 space-y-4">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex space-x-3">
                    <svg
                      className="flex-shrink-0 h-5 w-5 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StripeCheckoutView;