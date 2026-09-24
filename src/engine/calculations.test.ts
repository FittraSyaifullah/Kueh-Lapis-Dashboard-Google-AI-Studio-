import { calculatePlan, calculateCpf, calculateCashFlow, calculateRunway } from './calculations.ts';
import { SAMPLE_DEMO_PLAN } from './defaultData.ts';

export function runEngineTests(): { passed: boolean; results: { name: string; ok: boolean; message: string }[] } {
  const tests: { name: string; ok: boolean; message: string }[] = [];

  // Vector 1: Level 1 worked example
  // Take-home $4,200, expenses $3,250, cash flow +$950, total saved $18,000, savings rate 22.6%, runway 2.5 months.
  const plan = SAMPLE_DEMO_PLAN;
  const cf = calculateCashFlow(plan);
  const runway = calculateRunway(plan, cf.monthlyExpenses);

  const cfOk = cf.monthlyCashFlow === 950;
  tests.push({
    name: 'Level 1 Cash Flow Vector',
    ok: cfOk,
    message: `Expected +$950, got $${cf.monthlyCashFlow}`,
  });

  const savingsRatePct = (cf.savingsRate * 100).toFixed(1);
  const srOk = savingsRatePct === '22.6';
  tests.push({
    name: 'Level 1 Savings Rate Vector (22.6%)',
    ok: srOk,
    message: `Expected 22.6%, got ${savingsRatePct}%`,
  });

  const runwayMonths = Number(runway.cashRunwayMonths.toFixed(1));
  const runwayOk = runwayMonths === 2.5;
  tests.push({
    name: 'Level 1 Runway Vector (2.5 months cash)',
    ok: runwayOk,
    message: `Expected 2.5 months, got ${runwayMonths} months`,
  });

  const totalSavedOk = runway.totalSavings === 18000;
  tests.push({
    name: 'Level 1 Total Savings Vector ($18,000)',
    ok: totalSavedOk,
    message: `Expected $18,000, got $${runway.totalSavings}`,
  });

  // Vector 2: CPF split for 44-year-old sample with gross salary $7,500
  // OA share should be exactly $1,575 a month
  const cpf = calculateCpf(plan);
  const cpfOaOk = cpf.oaMonthly === 1575;
  tests.push({
    name: 'CPF Split Vector (44yo OA share = $1,575)',
    ok: cpfOaOk,
    message: `Expected $1,575 OA share, got $${cpf.oaMonthly}`,
  });

  // Master calculation
  const master = calculatePlan(plan);
  tests.push({
    name: 'Master Plan Calculation Completeness',
    ok: master.lumpSumNeeded > 0 && master.projectedFundAtRetirement > 0,
    message: `Lump sum needed: $${master.lumpSumNeeded.toLocaleString()}, Projected: $${master.projectedFundAtRetirement.toLocaleString()}`,
  });

  const allPassed = tests.every((t) => t.ok);
  return { passed: allPassed, results: tests };
}
