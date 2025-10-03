// Deterministic synthetic series (no randomness) so snapshots look stable.

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** Generate YYYY-MM strings going back `n` months including current month */
function lastNMonths(n: number): string[] {
  const out: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const dd = new Date(d);
    dd.setMonth(d.getMonth() - i);
    out.push(`${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
}

/** Simple smooth monthly curve around base with gentle trend + seasonality */
function synthMonthly(n: number, base: number, trendPerMonth = 0.15, amp = 2) {
  const months = lastNMonths(n);
  return months.map((m, i) => {
    const theta = (i / (n - 1)) * Math.PI * 2;
    const seasonal = Math.sin(theta) * amp;
    const value = base + i * trendPerMonth + seasonal;
    return { date: m, value: Number(value.toFixed(1)) };
  });
}

/** Daily last N days (YYYY-MM-DD) */
function lastNDays(n: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const dd = new Date(today);
    dd.setDate(today.getDate() - i);
    out.push(dd.toISOString().slice(0, 10));
  }
  return out;
}

/** ET0 - rain anomaly: gently positive with pulses */
function synthAnomalyDaily(n = 30, base = 1.8, amp = 1.2) {
  const days = lastNDays(n);
  return days.map((d, i) => {
    const theta = (i / (n - 1)) * Math.PI * 2;
    const val = base + Math.sin(theta) * amp + Math.sin(theta * 3) * 0.3;
    const rain_mm = Math.max(0, 2.4 - val);
    const et0_mm = Math.max(0.1, val + 1.2);
    const anomaly_mm = Number((et0_mm - rain_mm).toFixed(2));
    return { date: d, rain_mm: Number(rain_mm.toFixed(2)), et0_mm: Number(et0_mm.toFixed(2)), anomaly_mm };
  });
}

/** Annual last 10 years */
function lastNYears(n: number): number[] {
  const y = new Date().getFullYear();
  const out: number[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(y - i);
  return out;
}

function synthAnnualCounts(n = 10, start = 220000, slope = 12000) {
  const years = lastNYears(n);
  return years.map((yy, i) => ({
    year: yy,
    count: Math.round(start + i * slope + Math.sin(i * 0.7) * 5000),
  }));
}

/** PUBLIC MOCKS (used by the hook) */
export const mockIMF_CPI_FOOD_24M = synthMonthly(24, 112.0, 0.25, 1.6); // index ~112→~116
export const mockWDI_CPI_YOY_10Y  = lastNYears(10).map((yy, i) => ({
  date: String(yy),
  value: Number(clamp(11 - i * 0.4 + Math.sin(i * 0.8) * 0.7, 2, 12).toFixed(1)) // % YoY
}));
export const mockCBE_INFLATION_24M = synthMonthly(24, 18.0, -0.25, 2.1); // Recent trend downward from ~20% to ~12%
export const mockOpenMeteo_30D    = synthAnomalyDaily(30, 1.8, 1.1);
export const mockUNHCR_10Y        = synthAnnualCounts(10, 265000, 9500);

// Phase 2 placeholders (render nicely with neutral tone)
export const mockFFPI_24M   = synthMonthly(24, 124.0, 0.10, 1.2);
export const mockWheat_24M  = synthMonthly(24, 255.0, -0.20, 6.0); // USD/ton trending slightly down
export const mockVegOil_24M = synthMonthly(24, 138.0, 0.05, 3.5);
export const mockSugar_24M  = synthMonthly(24, 152.0, -0.05, 2.1);

// Additional mocks for missing datasets
export const mockFX_USD_EGP_24M = synthMonthly(24, 47.2, 0.015, 0.6); // USD/EGP ~47.2→48.5
export const mockDietCost_24M = synthMonthly(24, 3.2, 0.01, 0.1); // USD cost of healthy diet
export const mockFIES_24M = synthMonthly(24, 28.5, 0.05, 1.2); // % food insecurity
export const mockCBE_FOOD_INFLATION_24M = synthMonthly(24, 8.2, -0.6, 2.1); // 8.2% food inflation trending down