export type PricingMode = 'PLAN SIMPLE' | 'PLAN PERSONALIZADO' | 'CUOTAS EXTRAORDINARIAS' | 'CALCULADORA';

export interface Project {
  id: string;
  name: string;
  location: string;
  description: string;
  basePrice: number;
  currency: string;
  frequencies: string[];
  paymentTerms: Record<string, { maxInstallments: number; annualRate: number }>;
}

export interface ScenarioResult {
  mode: PricingMode;
  summary: {
    basePrice: number;
    downPayment: number;
    financedAmount: number;
    frequency: string;
    installments: number;
    baseInstallmentAmount: number;
    totalInterest: number;
    totalExtra: number;
    totalCost: number;
  };
  schedule: Array<{
    period: number;
    principal: number;
    interest: number;
    extra: number;
    payment: number;
    remainingBalance: number;
  }>;
}
