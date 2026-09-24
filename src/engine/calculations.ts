import {
  AssumptionsConfig,
  BandThreshold,
  CalculatedResults,
  CpfRatesConfig,
  Plan,
  SensitivityPoint,
  ThresholdsConfig,
} from './types.ts';

import defaultAssumptions from '../config/assumptions.json';
import defaultCpfRates from '../config/cpf-rates.json';
import defaultThresholds from '../config/thresholds.json';

/**
 * Pure calculation functions for the Kueh Lapis Financial Dashboard.
 * Free of UI dependencies, testable, and shared by screens, PDF, and CI tests.
 */

export function calculateCashFlow(plan: Plan) {
  const takeHome = Math.max(0, plan.income.takeHomePay || 0);
  const otherIncome = Math.max(0, plan.income.otherIncome || 0);
  const monthlyIncome = takeHome + otherIncome;

  let monthlyNeeds = 0;
  let monthlyWants = 0;

  const itemBreakdown = (plan.expenses || []).map((item) => {
    const rawAmount = Math.max(0, Number(item.amount) || 0);
    const monthlyAmount = item.period === 'year' ? rawAmount / 12 : rawAmount;
    if (item.tag === 'need') {
      monthlyNeeds += monthlyAmount;
    } else {
      monthlyWants += monthlyAmount;
    }
    return {
      label: item.label,
      monthlyAmount,
      tag: item.tag,
      group: item.group,
    };
  });

  const monthlyExpenses = monthlyNeeds + monthlyWants;
  const monthlyCashFlow = monthlyIncome - monthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;

  let cashFlowStatus: 'surplus' | 'breakeven' | 'deficit' = 'breakeven';
  if (monthlyCashFlow > 0.01) {
    cashFlowStatus = 'surplus';
  } else if (monthlyCashFlow < -0.01) {
    cashFlowStatus = 'deficit';
  }

  const savingsRate = monthlyIncome > 0 ? Math.max(-1, monthlyCashFlow / monthlyIncome) : 0;
  const needsPercentage = monthlyExpenses > 0 ? (monthlyNeeds / monthlyExpenses) * 100 : 0;
  const wantsPercentage = monthlyExpenses > 0 ? (monthlyWants / monthlyExpenses) * 100 : 0;

  // Top 5 expenses by monthly amount
  const sortedExpenses = [...itemBreakdown].sort((a, b) => b.monthlyAmount - a.monthlyAmount);
  const top5Expenses = sortedExpenses.slice(0, 5).map((e) => ({
    label: e.label,
    monthlyAmount: Math.round(e.monthlyAmount),
    tag: e.tag,
    percentage: monthlyExpenses > 0 ? Math.round((e.monthlyAmount / monthlyExpenses) * 100) : 0,
  }));

  return {
    monthlyIncome,
    monthlyExpenses,
    monthlyNeeds,
    monthlyWants,
    needsPercentage,
    wantsPercentage,
    monthlyCashFlow,
    annualCashFlow,
    cashFlowStatus,
    savingsRate,
    top5Expenses,
  };
}

export function calculateRunway(
  plan: Plan,
  monthlyExpenses: number,
  thresholds: ThresholdsConfig = defaultThresholds as ThresholdsConfig,
) {
  const cash = Math.max(0, plan.savings?.cash || 0);
  const endowment = Math.max(0, plan.savings?.endowment || 0);
  const bonds = Math.max(0, plan.savings?.bonds || 0);
  const equities = Math.max(0, plan.savings?.equities || 0);
  const other = Math.max(0, plan.savings?.other || 0);

  const totalSavings = cash + endowment + bonds + equities + other;

  // Protect against division by zero (SW-19)
  const cashRunwayMonths = monthlyExpenses > 0 ? cash / monthlyExpenses : totalSavings > 0 ? 99 : 0;
  const totalRunwayMonths = monthlyExpenses > 0 ? totalSavings / monthlyExpenses : totalSavings > 0 ? 99 : 0;

  const cashRunwayBand = getRunwayBand(cashRunwayMonths, thresholds);
  const totalRunwayBand = getRunwayBand(totalRunwayMonths, thresholds);

  const bucketShares = [
    { key: 'cash' as const, label: 'Cash & Deposits', amount: cash, percentage: totalSavings > 0 ? (cash / totalSavings) * 100 : 0 },
    { key: 'endowment' as const, label: 'Endowments', amount: endowment, percentage: totalSavings > 0 ? (endowment / totalSavings) * 100 : 0 },
    { key: 'bonds' as const, label: 'Bonds & SSB', amount: bonds, percentage: totalSavings > 0 ? (bonds / totalSavings) * 100 : 0 },
    { key: 'equities' as const, label: 'Equities & ETFs', amount: equities, percentage: totalSavings > 0 ? (equities / totalSavings) * 100 : 0 },
    { key: 'other' as const, label: plan.savings?.otherLabel || 'Other Assets', amount: other, percentage: totalSavings > 0 ? (other / totalSavings) * 100 : 0 },
  ];

  return {
    totalSavings,
    cashRunwayMonths,
    totalRunwayMonths,
    cashRunwayBand,
    totalRunwayBand,
    bucketShares,
  };
}

export function calculateCpf(
  plan: Plan,
  cpfRates: CpfRatesConfig = defaultCpfRates as CpfRatesConfig,
) {
  const age = plan.profile.age ?? 35;
  const band = cpfRates.age_bands.find((b) => age >= b.min_age && age <= b.max_age) || cpfRates.age_bands[0];

  const grossMonthly = Math.max(0, plan.income.grossSalary || 0);
  const cappedWage = Math.min(grossMonthly, cpfRates.wage_ceiling_monthly);

  const employeeCpfMonthly = Math.round(cappedWage * band.employee_rate);
  const employerCpfMonthly = Math.round(cappedWage * band.employer_rate);
  const totalCpfMonthly = employeeCpfMonthly + employerCpfMonthly;

  // Allocation ratios by age band (2026 CPF Board)
  const oaMonthly = Math.round(cappedWage * band.allocation_wage_ratio.oa);
  const saMonthly = Math.round(cappedWage * band.allocation_wage_ratio.sa);
  const maMonthly = Math.round(cappedWage * band.allocation_wage_ratio.ma);

  const netSalaryMonthly = Math.max(0, grossMonthly - employeeCpfMonthly);

  // Projection of CPF balance to retirement age
  const retirementAge = plan.profile.retirementAge ?? 60;
  const years = Math.max(0, retirementAge - age);
  const currentOA = Math.max(0, plan.cpf?.oa || 0);
  const currentSA = Math.max(0, plan.cpf?.sa || 0);
  const currentMA = Math.max(0, plan.cpf?.ma || 0);
  const mortgageFromOA = Math.max(0, plan.cpf?.mortgageFromOA || 0);

  const netOaMonthly = Math.max(0, oaMonthly - mortgageFromOA);

  const rOA = cpfRates.interest_rates.oa;
  const rSA = cpfRates.interest_rates.sa;
  const rMA = cpfRates.interest_rates.ma;

  // Compound future contributions & balances
  const futureOA = compoundBalanceWithContributions(currentOA, netOaMonthly * 12, rOA, years);
  const futureSA = compoundBalanceWithContributions(currentSA, saMonthly * 12, rSA, years);
  const futureMA = compoundBalanceWithContributions(currentMA, maMonthly * 12, rMA, years);

  const projectedCpfAtRetirement = Math.round(futureOA + futureSA + futureMA);

  return {
    ageBand: band,
    eligibleWage: cappedWage,
    employeeCpfMonthly,
    employerCpfMonthly,
    totalCpfMonthly,
    oaMonthly,
    saMonthly,
    maMonthly,
    netSalaryMonthly,
    projectedCpfAtRetirement,
  };
}

export function calculateRetirementGap(
  plan: Plan,
  monthlyExpenses: number,
  annualCashFlow: number,
  assumptions: AssumptionsConfig = defaultAssumptions as AssumptionsConfig,
  thresholds: ThresholdsConfig = defaultThresholds as ThresholdsConfig,
) {
  const currentAge = plan.profile.age ?? 35;
  const retirementAge = plan.profile.retirementAge ?? assumptions.retirement_age_default ?? 60;
  const planningAge = plan.profile.planningAge ?? assumptions.planning_age_default ?? 85;

  const yearsToRetirement = Math.max(1, retirementAge - currentAge);
  const retirementYears = Math.max(1, planningAge - retirementAge);

  // Desired spend
  let desiredSpendMonthlyToday = 0;
  if (plan.lifestyle?.items && plan.lifestyle.items.length > 0) {
    desiredSpendMonthlyToday = plan.lifestyle.items.reduce((sum, item) => {
      const amt = Math.max(0, Number(item.amount) || 0);
      return sum + (item.period === 'year' ? amt / 12 : amt);
    }, 0);
  } else {
    // Default to current expenses if lifestyle layer not yet filled
    desiredSpendMonthlyToday = monthlyExpenses > 0 ? monthlyExpenses : 3000;
  }
  const desiredSpendAnnualToday = desiredSpendMonthlyToday * 12;

  const preRetInflation = plan.lifestyle?.inflationPre ?? assumptions.inflation.pre_retirement;
  const postRetInflation = plan.lifestyle?.inflationPost ?? assumptions.inflation.post_retirement;
  const postRetReturn = plan.returns?.postRetirementRate ?? assumptions.asset_classes.balanced.default_rate; // 6%

  // Future monthly cost at retirement age (inflated)
  const costAtRetirementMonthly = Math.round(
    desiredSpendMonthlyToday * Math.pow(1 + preRetInflation, yearsToRetirement),
  );
  const costAtRetirementAnnual = costAtRetirementMonthly * 12;

  // Lump sum needed formula:
  // Present Value at retirement age of a growing annuity for `retirementYears` years
  // S1 = costAtRetirementAnnual, growing at postRetInflation, discounted at postRetReturn
  const lumpSumNeededRaw = calculateGrowingAnnuityPV(
    costAtRetirementAnnual,
    postRetInflation,
    postRetReturn,
    retirementYears,
  );

  const otherRetirementIncomeAnnual = Math.max(0, (plan.otherRetirementIncome || 0) * 12);
  const otherIncomePV =
    otherRetirementIncomeAnnual > 0
      ? calculateAnnuityPV(otherRetirementIncomeAnnual, postRetReturn, retirementYears)
      : 0;

  const lumpSumNeeded = Math.max(0, Math.round(lumpSumNeededRaw - otherIncomePV));

  // Projected Fund at Retirement
  // 1. Existing savings grown at their respective asset class rates
  const rCash = assumptions.asset_classes.cash.default_rate;
  const rEndow = assumptions.asset_classes.endowment.default_rate;
  const rBonds = assumptions.asset_classes.bonds.default_rate;
  const rEquities = assumptions.asset_classes.equities.default_rate;
  const rOther = assumptions.asset_classes.other.default_rate;

  const savings = plan.savings || { cash: 0, endowment: 0, bonds: 0, equities: 0, other: 0 };
  const grownSavings =
    (savings.cash || 0) * Math.pow(1 + rCash, yearsToRetirement) +
    (savings.endowment || 0) * Math.pow(1 + rEndow, yearsToRetirement) +
    (savings.bonds || 0) * Math.pow(1 + rBonds, yearsToRetirement) +
    (savings.equities || 0) * Math.pow(1 + rEquities, yearsToRetirement) +
    (savings.other || 0) * Math.pow(1 + rOther, yearsToRetirement);

  // 2. Future annual savings compounded to retirement
  const preRetRate = plan.returns?.preRetirementRate ?? assumptions.asset_classes.balanced.default_rate;
  let futureSavingsFV = 0;
  if (annualCashFlow > 0 && preRetRate > 0) {
    futureSavingsFV = annualCashFlow * ((Math.pow(1 + preRetRate, yearsToRetirement) - 1) / preRetRate);
  } else if (annualCashFlow > 0) {
    futureSavingsFV = annualCashFlow * yearsToRetirement;
  }

  // 3. CPF (if toggled on)
  let cpfContributionFV = 0;
  if (plan.toggles?.countCpfTowardsFund && plan.cpf) {
    const cpfResults = calculateCpf(plan);
    cpfContributionFV = cpfResults.projectedCpfAtRetirement;
  }

  const projectedFundAtRetirement = Math.max(0, Math.round(grownSavings + futureSavingsFV + cpfContributionFV));

  // % Funded
  const fundedPercentage = lumpSumNeeded > 0 ? projectedFundAtRetirement / lumpSumNeeded : 1.0;
  const fundedBand = getFundedBand(fundedPercentage, thresholds);
  const shortfallOrSurplus = projectedFundAtRetirement - lumpSumNeeded;

  // Extra monthly saving needed to close shortfall
  let extraMonthlySavingNeeded = 0;
  if (shortfallOrSurplus < 0 && yearsToRetirement > 0) {
    const shortfall = Math.abs(shortfallOrSurplus);
    const r = preRetRate > 0 ? preRetRate : 0.04;
    const annuityFactor = (Math.pow(1 + r, yearsToRetirement) - 1) / r;
    extraMonthlySavingNeeded = Math.round((shortfall / annuityFactor) / 12);
  }

  // Earliest retirement age search
  let earliestRetirementAge: number | null = null;
  for (let testAge = currentAge + 1; testAge <= planningAge; testAge++) {
    const tYears = testAge - currentAge;
    const rYears = Math.max(1, planningAge - testAge);
    const futureCost = desiredSpendAnnualToday * Math.pow(1 + preRetInflation, tYears);
    const lsNeeded = calculateGrowingAnnuityPV(futureCost, postRetInflation, postRetReturn, rYears);

    const projectedTestFund =
      (savings.cash || 0) * Math.pow(1 + rCash, tYears) +
      (savings.endowment || 0) * Math.pow(1 + rEndow, tYears) +
      (savings.bonds || 0) * Math.pow(1 + rBonds, tYears) +
      (savings.equities || 0) * Math.pow(1 + rEquities, tYears) +
      (savings.other || 0) * Math.pow(1 + rOther, tYears) +
      (annualCashFlow > 0 && preRetRate > 0 ? annualCashFlow * ((Math.pow(1 + preRetRate, tYears) - 1) / preRetRate) : 0);

    if (projectedTestFund >= lsNeeded) {
      earliestRetirementAge = testAge;
      break;
    }
  }

  // Sensitivity table (+/- 4 years around retirement age)
  const sensitivityTable: SensitivityPoint[] = [];
  const minAgeTest = Math.max(currentAge + 2, retirementAge - 4);
  const maxAgeTest = Math.min(planningAge - 2, retirementAge + 4);

  for (let ageTest = minAgeTest; ageTest <= maxAgeTest; ageTest++) {
    const tYears = ageTest - currentAge;
    const rYears = Math.max(1, planningAge - ageTest);
    const annualSpendAtTest = desiredSpendAnnualToday * Math.pow(1 + preRetInflation, tYears);
    const ls = Math.round(calculateGrowingAnnuityPV(annualSpendAtTest, postRetInflation, postRetReturn, rYears));

    const proj = Math.round(
      (savings.cash || 0) * Math.pow(1 + rCash, tYears) +
      (savings.endowment || 0) * Math.pow(1 + rEndow, tYears) +
      (savings.bonds || 0) * Math.pow(1 + rBonds, tYears) +
      (savings.equities || 0) * Math.pow(1 + rEquities, tYears) +
      (savings.other || 0) * Math.pow(1 + rOther, tYears) +
      (annualCashFlow > 0 && preRetRate > 0 ? annualCashFlow * ((Math.pow(1 + preRetRate, tYears) - 1) / preRetRate) : 0),
    );

    const ratio = ls > 0 ? proj / ls : 1;
    const band = getFundedBand(ratio, thresholds);

    sensitivityTable.push({
      retirementAge: ageTest,
      yearsToRetire: tYears,
      lumpSumNeeded: ls,
      projectedFund: proj,
      fundedPercentage: ratio,
      status: band.status,
    });
  }

  return {
    desiredSpendMonthlyToday,
    desiredSpendAnnualToday,
    yearsToRetirement,
    retirementYears,
    costAtRetirementMonthly,
    costAtRetirementAnnual,
    lumpSumNeeded,
    projectedFundAtRetirement,
    fundedPercentage,
    fundedBand,
    shortfallOrSurplus,
    extraMonthlySavingNeeded,
    earliestRetirementAge,
    sensitivityTable,
  };
}

/**
 * Master calculation coordinator. Given a plan, produces the full derived results.
 * Guarantees zero side effects and never mutates input.
 */
export function calculatePlan(
  plan: Plan,
  assumptions: AssumptionsConfig = defaultAssumptions as AssumptionsConfig,
  thresholds: ThresholdsConfig = defaultThresholds as ThresholdsConfig,
  cpfRates: CpfRatesConfig = defaultCpfRates as CpfRatesConfig,
): CalculatedResults {
  const cashFlow = calculateCashFlow(plan);
  const runway = calculateRunway(plan, cashFlow.monthlyExpenses, thresholds);
  const savingsRateBand = getSavingsRateBand(cashFlow.savingsRate, thresholds);

  let cpfCalculations;
  if (plan.income.grossSalary || plan.cpf) {
    cpfCalculations = calculateCpf(plan, cpfRates);
  }

  const gap = calculateRetirementGap(
    plan,
    cashFlow.monthlyExpenses,
    cashFlow.annualCashFlow,
    assumptions,
    thresholds,
  );

  return {
    ...cashFlow,
    savingsRateBand,
    ...runway,
    cpfCalculations,
    ...gap,
  };
}

// Helper mathematical functions

export function calculateGrowingAnnuityPV(
  firstPayment: number,
  growthRate: number,
  discountRate: number,
  periods: number,
): number {
  if (periods <= 0 || firstPayment <= 0) return 0;

  // Timing: Living expenses are incurred across the year (beginning of year payments factor)
  // PV = firstPayment * (1 + discountRate) * (1 - ((1 + g) / (1 + r))^N) / (r - g)
  const diff = discountRate - growthRate;
  if (Math.abs(diff) < 0.0001) {
    return firstPayment * periods;
  }
  const ratio = (1 + growthRate) / (1 + discountRate);
  const pvBase = (firstPayment * (1 - Math.pow(ratio, periods))) / diff;
  return pvBase * (1 + discountRate);
}

export function calculateAnnuityPV(
  annualPayment: number,
  rate: number,
  periods: number,
): number {
  if (periods <= 0 || annualPayment <= 0) return 0;
  if (rate <= 0) return annualPayment * periods;
  return (annualPayment * (1 - Math.pow(1 + rate, -periods))) / rate;
}

export function compoundBalanceWithContributions(
  presentValue: number,
  annualContribution: number,
  interestRate: number,
  years: number,
): number {
  if (years <= 0) return presentValue;
  const fvInitial = presentValue * Math.pow(1 + interestRate, years);
  let fvContrib = 0;
  if (interestRate > 0) {
    fvContrib = annualContribution * ((Math.pow(1 + interestRate, years) - 1) / interestRate);
  } else {
    fvContrib = annualContribution * years;
  }
  return fvInitial + fvContrib;
}

export function getSavingsRateBand(
  rate: number,
  thresholds: ThresholdsConfig = defaultThresholds as ThresholdsConfig,
): BandThreshold {
  for (const band of thresholds.savings_rate_bands) {
    if (rate >= band.min) {
      return band;
    }
  }
  return thresholds.savings_rate_bands[thresholds.savings_rate_bands.length - 1];
}

export function getRunwayBand(
  months: number,
  thresholds: ThresholdsConfig = defaultThresholds as ThresholdsConfig,
): BandThreshold {
  for (const band of thresholds.runway_months_bands) {
    if (months >= band.min) {
      return band;
    }
  }
  return thresholds.runway_months_bands[thresholds.runway_months_bands.length - 1];
}

export function getFundedBand(
  ratio: number,
  thresholds: ThresholdsConfig = defaultThresholds as ThresholdsConfig,
): BandThreshold {
  for (const band of thresholds.funded_bands) {
    if (ratio >= band.min) {
      return band;
    }
  }
  return thresholds.funded_bands[thresholds.funded_bands.length - 1];
}
