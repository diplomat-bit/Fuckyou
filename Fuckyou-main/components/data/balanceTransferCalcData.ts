export interface BalanceTransferOffer {
  id: string;
  name: string;
  bank: string;
  introApr: number; // percentage, e.g., 0 for 0%
  introPeriodMonths: number; // duration in months, e.g., 18
  transferFeePercent: number; // percentage, e.g., 3 for 3%
  annualFee: number; // annual fee in dollars
  rating?: number; // star rating out of 5
  features?: string[];
}

export interface BalanceTransferInputs {
  currentBalance: number;
  currentApr: number;
  currentMonthlyPayment: number;
  selectedOfferId: string; // 'custom' or one of the offer IDs
  customIntroApr: number;
  customIntroPeriod: number;
  customTransferFee: number;
}

export const DEFAULT_OFFERS: BalanceTransferOffer[] = [
  {
    id: 'offer-long-term',
    name: 'Super Long 0% APR Card',
    bank: 'Apex Bank',
    introApr: 0,
    introPeriodMonths: 21,
    transferFeePercent: 5,
    annualFee: 0,
    rating: 4.8,
    features: ['21 months of 0% Intro APR', 'No annual fee', 'Cell phone protection plan'],
  },
  {
    id: 'offer-low-fee',
    name: 'Low Fee Balance Transfer Card',
    bank: 'Horizon Credit',
    introApr: 0,
    introPeriodMonths: 15,
    transferFeePercent: 3,
    annualFee: 0,
    rating: 4.6,
    features: ['Low 3% transfer fee', '15 months of 0% Intro APR', '1.5% cash back on new purchases'],
  },
  {
    id: 'offer-no-fee-short',
    name: 'Zero Fee Promo Card',
    bank: 'Community Trust',
    introApr: 0,
    introPeriodMonths: 12,
    transferFeePercent: 0,
    annualFee: 0,
    rating: 4.5,
    features: ['Absolutely $0 transfer fee', '12 months of 0% Intro APR', 'No annual fee ever'],
  },
  {
    id: 'offer-premium-rewards',
    name: 'Travel Rewards Transfer Card',
    bank: 'Vanguard Financial',
    introApr: 1.99,
    introPeriodMonths: 18,
    transferFeePercent: 3,
    annualFee: 95,
    rating: 4.2,
    features: ['Low 1.99% APR for 18 months', '50,000 bonus travel miles', 'Premium travel insurance benefits'],
  }
];

export const INITIAL_INPUTS: BalanceTransferInputs = {
  currentBalance: 5000,
  currentApr: 21.99,
  currentMonthlyPayment: 150,
  selectedOfferId: 'offer-low-fee',
  customIntroApr: 0,
  customIntroPeriod: 18,
  customTransferFee: 3,
};