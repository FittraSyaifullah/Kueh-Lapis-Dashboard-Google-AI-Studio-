import { Plan } from './types.ts';
import defaultExpenses from '../config/expenses.json';

export const BLANK_PLAN: Plan = {
  version: '1.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  configVersion: '2026.1',
  sessionCode: 'TOA-PAYOH-L1',
  profile: {
    name: '',
    age: 35,
    retirementAge: 60,
    planningAge: 85,
  },
  income: {
    takeHomePay: 0,
    otherIncome: 0,
    grossSalary: 0,
    yearlyBonus: 0,
  },
  expenses: defaultExpenses.groups.flatMap((g) =>
    g.items.map((it) => ({
      id: it.id,
      group: g.label,
      label: it.label,
      amount: 0,
      period: it.default_period as 'month' | 'year',
      tag: it.default_tag as 'need' | 'want',
      custom: false,
    })),
  ),
  savings: {
    cash: 0,
    endowment: 0,
    bonds: 0,
    equities: 0,
    other: 0,
    otherLabel: 'Other Assets',
  },
  cpf: {
    oa: 0,
    sa: 0,
    ma: 0,
    mortgageFromOA: 0,
  },
  lifestyle: {
    items: [
      { id: 'ls_1', label: 'Basic Shelter & Utilities', amount: 800, period: 'month' },
      { id: 'ls_2', label: 'Food & Groceries', amount: 1000, period: 'month' },
      { id: 'ls_3', label: 'Medical & Health Insurance', amount: 700, period: 'month' },
      { id: 'ls_4', label: 'Hobbies, Social & Leisure', amount: 1000, period: 'month' },
      { id: 'ls_5', label: 'Travel & Vacations', amount: 12000, period: 'year' },
    ],
    inflationPre: 0.03,
    inflationPost: 0.03,
  },
  returns: {
    preRetirementRate: 0.06,
    fundMix: 'Balanced Portfolio (60/40)',
    postRetirementRate: 0.04,
  },
  otherRetirementIncome: 0,
  toggles: {
    countCpfTowardsFund: true,
  },
  consent: {
    sharedWithAAG: false,
  },
};

/**
 * Verified sample data matching Section 8 of PRD:
 * - Take-home: $4,200
 * - Expenses: $3,250
 * - Cash Flow: +$950
 * - Total Saved: $18,000 (Cash $8,125 gives exactly 2.5 months runway: 8,125 / 3,250 = 2.5 mo)
 * - Savings Rate: 22.6%
 * - Age 44 sample with gross salary $7,500 (OA share: $1,575/month)
 */
export const SAMPLE_DEMO_PLAN: Plan = {
  version: '1.0',
  createdAt: '2026-03-01T08:00:00.000Z',
  updatedAt: new Date().toISOString(),
  configVersion: '2026.1',
  sessionCode: 'DEMO-SAMPLE',
  profile: {
    name: 'Sarah Tan',
    age: 44,
    retirementAge: 60,
    planningAge: 85,
  },
  income: {
    takeHomePay: 4200,
    otherIncome: 0,
    grossSalary: 7500,
    yearlyBonus: 7500,
  },
  expenses: [
    { id: 'exp_rent_mortgage', group: 'Housing & Shelter', label: 'Rent / Mortgage (Cash portion)', amount: 1100, period: 'month', tag: 'need', custom: false },
    { id: 'exp_utilities', group: 'Housing & Shelter', label: 'Utilities (SP Group / electricity / water)', amount: 180, period: 'month', tag: 'need', custom: false },
    { id: 'exp_broadband_mobile', group: 'Housing & Shelter', label: 'Broadband & Mobile Plans', amount: 120, period: 'month', tag: 'need', custom: false },
    { id: 'exp_groceries', group: 'Food & Sustenance', label: 'Groceries & Supermarket staples', amount: 500, period: 'month', tag: 'need', custom: false },
    { id: 'exp_hawker_meals', group: 'Food & Sustenance', label: 'Daily Meals & Hawker lunches', amount: 350, period: 'month', tag: 'need', custom: false },
    { id: 'exp_dining_out', group: 'Food & Sustenance', label: 'Dining Out, Cafes & Restaurants', amount: 250, period: 'month', tag: 'want', custom: false },
    { id: 'exp_public_transit', group: 'Transport & Mobility', label: 'Public Transport (Bus / MRT)', amount: 150, period: 'month', tag: 'need', custom: false },
    { id: 'exp_health_insurance', group: 'Family, Healthcare & Insurance', label: 'Hospital & Life Insurance (Cash premiums)', amount: 2400, period: 'year', tag: 'need', custom: false }, // $200/mo
    { id: 'exp_streaming_subs', group: 'Lifestyle, Subscriptions & Leisure', label: 'Subscriptions (Netflix, Spotify, Cloud)', amount: 50, period: 'month', tag: 'want', custom: false },
    { id: 'exp_shopping_clothes', group: 'Lifestyle, Subscriptions & Leisure', label: 'Shopping & Personal care', amount: 150, period: 'month', tag: 'want', custom: false },
    { id: 'exp_travel_vacations', group: 'Lifestyle, Subscriptions & Leisure', label: 'Annual Holidays & Short getaways', amount: 2400, period: 'year', tag: 'want', custom: false }, // $200/mo
  ],
  savings: {
    cash: 8125, // Exactly 2.5 months runway: 8,125 / 3,250 = 2.5
    endowment: 3875,
    bonds: 0,
    equities: 6000,
    other: 0,
    otherLabel: 'Other Assets',
  },
  cpf: {
    oa: 65000,
    sa: 45000,
    ma: 32000,
    mortgageFromOA: 800,
  },
  lifestyle: {
    items: [
      { id: 'ls_1', label: 'Essential Housing, Utilities & Food', amount: 2000, period: 'month' },
      { id: 'ls_2', label: 'Medical, Supplements & Long-term Care', amount: 1000, period: 'month' },
      { id: 'ls_3', label: 'Social Outings, Hobbies & Dinners', amount: 800, period: 'month' },
      { id: 'ls_4', label: 'Annual Travel & Enriching Holidays', amount: 8400, period: 'year' }, // $700/mo -> total $4,500/mo
    ],
    inflationPre: 0.03,
    inflationPost: 0.03,
  },
  returns: {
    preRetirementRate: 0.06,
    fundMix: 'Balanced Portfolio (60/40)',
    postRetirementRate: 0.04,
  },
  otherRetirementIncome: 0,
  toggles: {
    countCpfTowardsFund: true,
  },
  consent: {
    sharedWithAAG: false,
  },
};

const STORAGE_KEY = 'kueh_lapis_plan_v1';

export function loadStoredPlan(): Plan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch {
    // Graceful fallback on storage access denial or corruption
  }
  return null;
}

export function saveStoredPlan(plan: Plan): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {
    // Graceful fallback
  }
}

export function clearStoredPlan(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Graceful fallback
  }
}

/**
 * Generates an 8-character human-readable return code (SW-33)
 * Encodes plan session and checksum for Workshop 2 resumption.
 */
export function generateReturnCode(plan: Plan): string {
  const seed = `${plan.profile.name || 'ANON'}-${plan.income.takeHomePay}-${plan.expenses.length}-${plan.updatedAt}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = 'KL-';
  let num = Math.abs(hash);
  for (let i = 0; i < 5; i++) {
    code += chars[num % chars.length];
    num = Math.floor(num / chars.length) + (i * 7);
  }
  return code;
}
