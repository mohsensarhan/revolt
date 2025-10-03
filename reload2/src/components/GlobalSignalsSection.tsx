import React from 'react';
import { PageGrid } from '@/layout/PageGrid';
import { Card } from '@/components/ui/card';
import { MetricMicroCard } from './MetricMicroCard';
import { useGlobalSignals } from '@/hooks/useGlobalSignals';
import { FORCE_MOCK, DATA_SOURCE } from '@/config/dataMode';

// Safe array access helpers
const last = <T,>(arr: T[]) => (Array.isArray(arr) && arr.length ? arr[arr.length - 1] : undefined);
const prev = <T,>(arr: T[]) => (Array.isArray(arr) && arr.length > 1 ? arr[arr.length - 2] : undefined);
const lastNonNull = (arr: Array<{ v: number }>) => {
  for (let i = arr.length - 1; i >= 0; i--) if (Number.isFinite(arr[i].v)) return arr[i];
  return undefined;
};

// Helper to determine data status based on DATA_SOURCE and connection
const getDataStatus = (source: keyof typeof DATA_SOURCE, isLoading: boolean, isError: boolean): 'live' | 'mock' | 'disconnected' => {
  if (isError) return 'disconnected';
  return DATA_SOURCE[source] === 'live' ? 'live' : 'mock';
};

export function GlobalSignalsSection() {
  const s = useGlobalSignals();
  
  console.log('[DEBUG] GlobalSignalsSection signals data:', {
    ffpi: s.ffpi?.slice(0, 2),
    fx: s.fx?.slice(0, 2),
    isLoading: s.isLoading,
    isError: s.isError
  });

  return (
    <div className="space-y-3">
      {FORCE_MOCK && (
        <Card className="executive-card p-3 text-[12px] text-muted-foreground">
          Mock mode is <strong>ON</strong> (CORS-safe preview). Flip <code>FORCE_MOCK=false</code> in <code>src/config/dataMode.ts</code> after deploying /api proxies.
        </Card>
      )}

      <PageGrid cols={4} className="mb-6">
        {/* Row A — Global pressure */}
        <MetricMicroCard
          title="FAO Food Price Index"
          value={Number((last(s.ffpi) as any)?.value) || 0}
          format="number"
          unit="index"
          description="Measures global food commodity price changes. Index value where 2014-2016 average = 100. Higher values indicate more expensive food globally relative to the base period."
          dataStatus={getDataStatus('ffpi', s.isLoading, s.isError)}
          dataSource="FAO"
          delta={(() => {
            const curr = last(s.ffpi) as any;
            const prevVal = prev(s.ffpi) as any;
            if (!curr || !prevVal || typeof curr.value !== 'number' || typeof prevVal.value !== 'number') return undefined;
            const pct = ((curr.value - prevVal.value) / prevVal.value) * 100;
            return { value: pct, label: 'm/m', direction: pct >= 0 ? 'up' as const : 'down' as const };
          })()}
          spark={(s.ffpi as any[]).map(p => ({ t: p.date, v: p.value }))}
        />

        <MetricMicroCard
          title="USD/EGP Exchange Rate"
          value={Number((last(s.fx) as any)?.value) || 0}
          format="number"
          unit="EGP per USD"
          description="How many Egyptian Pounds needed to buy 1 US Dollar. Higher values mean weaker EGP, making imports more expensive and affecting food costs."
          dataStatus={getDataStatus('fx', s.isLoading, s.isError)}
          dataSource="Central Bank of Egypt"
          delta={(() => {
            const curr = last(s.fx) as any;
            const prevVal = prev(s.fx) as any;
            if (!curr || !prevVal || typeof curr.value !== 'number' || typeof prevVal.value !== 'number') return undefined;
            const pct = ((curr.value - prevVal.value) / prevVal.value) * 100;
            return { value: pct, label: 'm/m', direction: pct >= 0 ? 'up' as const : 'down' as const };
          })()}
          spark={(s.fx as any[]).map(p => ({ t: p.date, v: p.value }))}
        />

        <MetricMicroCard
          title="Cost of Healthy Diet"
          value={Number((last(s.diet) as any)?.value) || 0}
          format="number"
          unit="int-$/day"
          description="Daily cost for one person to afford the least expensive healthy diet in Egypt. Measured in international dollars (purchasing power parity adjusted). Higher values indicate food becoming less affordable."
          dataStatus={getDataStatus('diet', s.isLoading, s.isError)}
          dataSource="Our World in Data"
          delta={(() => {
            const curr = last(s.diet) as any;
            const prevVal = prev(s.diet) as any;
            if (!curr || !prevVal || typeof curr.value !== 'number' || typeof prevVal.value !== 'number') return undefined;
            const pct = ((curr.value - prevVal.value) / prevVal.value) * 100;
            return { value: pct, label: 'y/y', direction: pct >= 0 ? 'up' as const : 'down' as const };
          })()}
          spark={(s.diet as any[]).map(p => ({ t: p.date, v: p.value }))}
        />

        <MetricMicroCard
          title="Food Insecurity (FIES)"
          value={Number((last(s.fies) as any)?.value) || 0}
          format="percentage"
          description="Percentage of Egypt's population experiencing moderate or severe food insecurity. Based on Food Insecurity Experience Scale. Higher percentages indicate more people struggling to access adequate food."
          dataStatus={getDataStatus('fies', s.isLoading, s.isError)}
          dataSource="Our World in Data"
          delta={(() => {
            const curr = last(s.fies) as any;
            const prevVal = prev(s.fies) as any;
            if (!curr || !prevVal || typeof curr.value !== 'number' || typeof prevVal.value !== 'number') return undefined;
            const d = curr.value - prevVal.value;
            return { value: d, label: 'Δ', direction: d >= 0 ? 'up' as const : 'down' as const };
          })()}
          spark={(s.fies as any[]).map(p => ({ t: p.date, v: p.value }))}
        />
      </PageGrid>

      <PageGrid cols={4} className="mb-6">
        {/* Row B — Egypt exposure */}

        <MetricMicroCard
          title="Egypt CPI YoY"
          value={Number((last(s.cbeInflation) as any)?.value) || 0}
          format="percentage"
          description="Egypt's official annual inflation rate from the Central Bank of Egypt (CBE). Shows percentage change in consumer prices compared to same month previous year as published by CBE."
          dataStatus={getDataStatus('cbe', s.isLoading, s.isError)}
          dataSource="Central Bank of Egypt"
          delta={(() => {
            const curr = last(s.cbeInflation) as any;
            const prevVal = prev(s.cbeInflation) as any;
            if (!curr || !prevVal || typeof curr.value !== 'number' || typeof prevVal.value !== 'number') return undefined;
            const d = curr.value - prevVal.value;
            return { value: d, label: 'Δ', direction: d >= 0 ? 'up' as const : 'down' as const };
          })()}
          spark={(s.cbeInflation as any[]).map(p => ({ t: p.date, v: p.value }))}
        />

        <MetricMicroCard
          title="CBE Food Inflation"
          value={Number((last(s.cbeFood) as any)?.value) || 0}
          format="percentage"
          description="Egypt's food-specific inflation rate from Central Bank of Egypt, focusing on fruits and vegetables component. Shows year-over-year change in food prices, providing insight into food affordability trends."
          dataStatus={getDataStatus('cbeFood', s.isLoading, s.isError)}
          dataSource="CBE Food Prices"
          delta={(() => {
            const curr = last(s.cbeFood) as any;
            const prevVal = prev(s.cbeFood) as any;
            if (!curr || !prevVal || typeof curr.value !== 'number' || typeof prevVal.value !== 'number') return undefined;
            const d = curr.value - prevVal.value;
            return { value: d, label: 'Δ', direction: d >= 0 ? 'up' as const : 'down' as const };
          })()}
          spark={(s.cbeFood as any[]).map(p => ({ t: p.date, v: p.value }))}
        />

        <MetricMicroCard
          title="Rain - ET₀ Anomaly"
          value={(() => {
            const recentEt0 = s.et0.slice(-7);
            const avgEt0 = recentEt0.reduce((sum, p) => sum + ((p as any).value || (p as any).anomaly_mm || 0), 0) / recentEt0.length;
            return avgEt0;
          })()}
          format="number"
          unit="mm/day"
          description="7-day average reference evapotranspiration anomaly in Egypt, measured in millimeters per day. Positive values indicate higher than normal water stress on crops, negative values indicate better conditions."
          dataStatus={getDataStatus('openmeteo', s.isLoading, s.isError)}
          dataSource="Open-Meteo"
          delta={(() => {
            const recent7 = s.et0.slice(-7);
            const prev7 = s.et0.slice(-14, -7);
            if (recent7.length === 0 || prev7.length === 0) return undefined;
            const recentAvg = recent7.reduce((sum, p) => sum + ((p as any).value || (p as any).anomaly_mm || 0), 0) / recent7.length;
            const prevAvg = prev7.reduce((sum, p) => sum + ((p as any).value || (p as any).anomaly_mm || 0), 0) / prev7.length;
            const pct = prevAvg === 0 ? 0 : ((recentAvg - prevAvg) / Math.abs(prevAvg)) * 100;
            return { value: pct, label: '7d', direction: pct >= 0 ? 'up' as const : 'down' as const };
          })()}
          spark={s.et0.map(p => ({ t: (p as any).date, v: (p as any).value || (p as any).anomaly_mm || 0 }))}
        />

        <MetricMicroCard
          title="Refugees in Egypt"
          value={Number((last(s.refugees as any[]))?.value) || 0}
          format="number"
          unit="people"
          description="Total number of refugees and asylum-seekers registered with UNHCR in Egypt. Counts individual people displaced from their home countries. Higher numbers indicate increased regional instability affecting migration."
          dataStatus={getDataStatus('unhcr', s.isLoading, s.isError)}
          dataSource="UNHCR"
          delta={(() => {
            const refugeesData = s.refugees as any[];
            const curr = last(refugeesData);
            const prevVal = prev(refugeesData);
            if (!curr || !prevVal || typeof curr.value !== 'number' || typeof prevVal.value !== 'number') return undefined;
            const pct = ((curr.value - prevVal.value) / prevVal.value) * 100;
            return { value: pct, label: 'y/y', direction: pct >= 0 ? 'up' as const : 'down' as const };
          })()}
          spark={(s.refugees as any[]).map(p => ({ t: p.date, v: p.value }))}
        />
      </PageGrid>
    </div>
  );
}