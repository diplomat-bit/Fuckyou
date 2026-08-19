

// --- CONSOLIDATED FROM: ./stripe-nexus-types.ts ---


export interface Charge {
    id: string;
    amount: number;
    amount_refunded: number;
    currency: string;
    status: string;
    refunded: boolean;
    payment_intent: string;
    description?: string;
}
      

// --- CONSOLIDATED FROM: ./lib/stripe-nexus-types.ts ---


export interface Charge {
    id: string;
    amount: number;
    amount_refunded: number;
    currency: string;
    status: string;
    refunded: boolean;
    payment_intent: string;
    description?: string;
}
      