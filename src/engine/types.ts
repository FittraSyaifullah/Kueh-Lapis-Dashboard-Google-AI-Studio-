export type ExpensePeriod = 'month' | 'year';
export type ExpenseTag = 'need' | 'want';

export interface ExpenseItem {
  id: string;
  group: string;
  label: string;
  amount: number;
  period: ExpensePeriod;
  tag: ExpenseTag;
  custom?: boolean;
}

export interface SavingsBuckets {
  cash: number;
  endowment: number;
  bonds: number;
  equities: number;
  other: number;
  otherLabel?: string;
}

export interface CpfData {
  oa: number;
  sa: number;
  ma: number;
  mortgageFromOA: number;
}

export interface LifestyleItem {
  id: string;
  label: string;
  amount: number;
  period: ExpensePeriod;
  custom?: boolean;
}

export interface PlanProfile {
  name?: string;
  age?: number;
  retirementAge?: number;
  planningAge?: number;
}

export interface PlanIncome {
  takeHomePay: number; // Level 0-1 net take-home
  otherIncome: number;
  grossSalary?: number; // Level 2
  yearlyBonus?: number; // Level 2
}

export interface PlanLifestyle {
  items: LifestyleItem[];
  inflationPre: number;
  inflationPost: number;
}

export interface PlanReturns {
  preRetirementRate: number;
  fundMix: string;
  postRetirementRate: number;
}

export interface PlanToggles {
  countCpfTowardsFund: boolean;
}

export interface PlanConsent {
  sharedWithAAG: boolean;
  timestamp?: string;
  consentedAt?: string;
  wordingVersion?: string;
  participantContact?: string;
}

export interface Plan {
  version: string;
  createdAt: string;
  updatedAt: string;
  configVersion: string;
  sessionCode: string;
  profile: PlanProfile;
  income: PlanIncome;
  expenses: ExpenseItem[];
  savings: SavingsBuckets;
  cpf?: CpfData;
  lifestyle?: PlanLifestyle;
  returns?: PlanReturns;
  otherRetirementIncome?: number;
  toggles: PlanToggles;
  consent?: PlanConsent;
}

export interface SessionConfig {
  code: string;
  name: string;
  unlocked_level: number;
  sample_data: boolean;
  need_want_tagging: boolean;
  monthly_yearly_toggle: boolean;
  locked_layers_visible: boolean;
  notes?: string;
}

export interface BandThreshold {
  min: number;
  status: string;
  color: 'emerald' | 'teal' | 'amber' | 'orange' | 'rose';
  explanation: string;
}

export interface CpfAgeBand {
  min_age: number;
  max_age: number;
  label: string;
  employee_rate: number;
  employer_rate: number;
  total_rate: number;
  allocation_wage_ratio: {
    oa: number;
    sa: number;
    ma: number;
  };
  allocation_shares: {
    oa: number;
    sa: number;
    ma: number;
  };
}

export interface CpfRatesConfig {
  effective_year: number;
  wage_ceiling_monthly: number;
  annual_wage_ceiling: number;
  interest_rates: {
    oa: number;
    sa: number;
    ma: number;
    ra: number;
  };
  age_bands: CpfAgeBand[];
  disclaimers: string[];
}

export interface AssumptionsConfig {
  version: string;
  planning_age_default: number;
  retirement_age_default: number;
  current_age_default: number;
  inflation: {
    pre_retirement: number;
    post_retirement: number;
    min: number;
    max: number;
  };
  asset_classes: Record<
    string,
    {
      label: string;
      default_rate: number;
      description: string;
    }
  >;
  cpf_interest: {
    oa: number;
    sa: number;
    ma: number;
    ra: number;
  };
  disclaimer: string;
}

export interface ThresholdsConfig {
  version: string;
  savings_rate_bands: BandThreshold[];
  runway_months_bands: BandThreshold[];
  need_want_warning: {
    want_percent_threshold: number;
    warning_text: string;
  };
  funded_bands: BandThreshold[];
}

export interface SensitivityPoint {
  retirementAge: number;
  yearsToRetire: number;
  lumpSumNeeded: number;
  projectedFund: number;
  fundedPercentage: number;
  status: string;
}

export interface CalculatedResults {
  // Layer 1: Cash Flow
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNeeds: number;
  monthlyWants: number;
  needsPercentage: number;
  wantsPercentage: number;
  monthlyCashFlow: number; // income - expenses
  annualCashFlow: number;
  cashFlowStatus: 'surplus' | 'breakeven' | 'deficit';
  savingsRate: number; // cashFlow / income
  savingsRateBand: BandThreshold;
  top5Expenses: { label: string; monthlyAmount: number; tag: ExpenseTag; percentage: number }[];

  // Layer 1: Savings & Runway
  totalSavings: number;
  cashRunwayMonths: number;
  totalRunwayMonths: number;
  cashRunwayBand: BandThreshold;
  totalRunwayBand: BandThreshold;
  bucketShares: {
    key: keyof SavingsBuckets;
    label: string;
    amount: number;
    percentage: number;
  }[];

  // Layer 2: CPF (if age or gross salary provided)
  cpfCalculations?: {
    ageBand: CpfAgeBand;
    eligibleWage: number;
    employeeCpfMonthly: number;
    employerCpfMonthly: number;
    totalCpfMonthly: number;
    oaMonthly: number;
    saMonthly: number;
    maMonthly: number;
    netSalaryMonthly: number;
    projectedCpfAtRetirement: number;
  };

  // Layer 3: Lifestyle
  desiredSpendMonthlyToday: number;
  desiredSpendAnnualToday: number;
  yearsToRetirement: number;
  retirementYears: number;
  costAtRetirementMonthly: number;
  costAtRetirementAnnual: number;

  // Layer 4: Retirement Gap & Projection
  lumpSumNeeded: number;
  projectedFundAtRetirement: number;
  fundedPercentage: number;
  fundedBand: BandThreshold;
  shortfallOrSurplus: number;
  extraMonthlySavingNeeded: number;
  earliestRetirementAge: number | null;
  sensitivityTable: SensitivityPoint[];
}
