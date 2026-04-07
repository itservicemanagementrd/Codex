import { HttpError } from '../utils/httpError.js';

const frequencyFactor = {
  monthly: 12,
  biweekly: 26,
  weekly: 52
};

function round2(value) {
  return Math.round(value * 100) / 100;
}

function amortizationPayment(principal, periodicRate, installments) {
  if (installments <= 0) return 0;
  if (periodicRate === 0) return principal / installments;
  return (principal * periodicRate) / (1 - (1 + periodicRate) ** -installments);
}

export function calculateScenario({ mode, project, downPayment = 0, frequency = 'monthly', installments, extraPayments = [] }) {
  const basePrice = Number(project.basePrice);
  const initialDown = Number(downPayment);

  if (initialDown < 0 || initialDown > basePrice) {
    throw new HttpError(400, 'Down payment must be between 0 and base price');
  }

  const termConfig = project.paymentTerms[frequency];
  if (!termConfig) {
    throw new HttpError(400, `Unsupported frequency: ${frequency}`);
  }

  const periodsPerYear = frequencyFactor[frequency] || 12;
  const periodicRate = termConfig.annualRate / periodsPerYear;
  const principal = basePrice - initialDown;

  let resolvedInstallments = Number(installments) || termConfig.maxInstallments;

  if (mode === 'CALCULADORA') {
    const targetPayment = Math.max(principal / termConfig.maxInstallments, 350);
    resolvedInstallments = Math.ceil(principal / targetPayment);
    resolvedInstallments = Math.min(Math.max(1, resolvedInstallments), termConfig.maxInstallments);
  }

  const basePayment = amortizationPayment(principal, periodicRate, resolvedInstallments);

  const schedule = [];
  let balance = principal;
  let totalInterest = 0;
  let totalExtra = 0;

  for (let i = 1; i <= resolvedInstallments; i += 1) {
    const interest = round2(balance * periodicRate);
    const principalPortion = round2(Math.min(basePayment - interest, balance));
    const extra = Number(extraPayments.find((p) => Number(p.period) === i)?.amount || 0);
    totalExtra += extra;
    const payment = round2(principalPortion + interest + extra);
    balance = round2(Math.max(0, balance - principalPortion - extra));
    totalInterest += interest;

    schedule.push({
      period: i,
      principal: principalPortion,
      interest,
      extra,
      payment,
      remainingBalance: balance
    });

    if (balance <= 0) {
      break;
    }
  }

  const totalCost = round2(initialDown + schedule.reduce((sum, row) => sum + row.payment, 0));

  return {
    mode,
    summary: {
      basePrice,
      downPayment: initialDown,
      financedAmount: principal,
      frequency,
      installments: schedule.length,
      baseInstallmentAmount: round2(basePayment),
      totalInterest: round2(totalInterest),
      totalExtra: round2(totalExtra),
      totalCost
    },
    schedule: mode === 'PLAN SIMPLE' ? [] : schedule,
    metadata: {
      generatedAt: new Date().toISOString()
    }
  };
}
