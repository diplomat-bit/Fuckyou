
import { useState, useEffect } from 'react';
import { Edge, Node } from 'reactflow';

export type ResourceType = string;
export type StripeResource = any;
export type NodeData = any;
export type EdgeData = any;

export const isEdge = (element: any): element is Edge => element.id && element.source && element.target;
export const isNode = (element: any): element is Node => element.id && !element.source;

export const useStripeData = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data fetch to populate the graph
    setTimeout(() => {
      setData({
        'cus_1': { id: 'cus_1', object: 'customer', name: 'John Doe', email: 'john@example.com' },
        'ch_1': { id: 'ch_1', object: 'charge', amount: 5000, currency: 'usd', customer: 'cus_1', status: 'succeeded' },
        'in_1': { id: 'in_1', object: 'invoice', customer: 'cus_1', amount_due: 5000, status: 'paid', charge: 'ch_1' },
        'pm_1': { id: 'pm_1', object: 'payment_method', customer: 'cus_1', type: 'card' },
        'sub_1': { id: 'sub_1', object: 'subscription', customer: 'cus_1', status: 'active', items: { data: [{ price: { product: 'prod_1' } }] } },
        'prod_1': { id: 'prod_1', object: 'product', name: 'Premium Plan' },
        'cus_2': { id: 'cus_2', object: 'customer', name: 'Alice Smith', email: 'alice@example.com' },
        'ch_2': { id: 'ch_2', object: 'charge', amount: 2500, currency: 'usd', customer: 'cus_2', status: 'failed' },
        'evt_1': { id: 'evt_1', object: 'event', type: 'charge.failed', data: { object: 'ch_2' } }
      });
      setLoading(false);
    }, 1000);
  }, []);

  return { data, loading, error };
};
