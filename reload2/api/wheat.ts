export const config = { runtime: 'edge' };
import { json, fail, csvToSeries } from './_utils.ts';

// World Bank Pink Sheet commodity prices - Wheat (Hard Red Winter, US Gulf)
const WB_PINK_WHEAT = 'https://thedocs.worldbank.org/en/doc/5d903e848db1d1b83e0ec8f744e55570-0350012021/related/CMO-Historical-Data-Monthly.xlsx';
// Fallback to OWID wheat prices CSV
const OWID_WHEAT = 'https://ourworldindata.org/grapher/wheat-prices.csv';

export default async function handler() {
  try {
    // Try OWID wheat prices CSV (more reliable for automated parsing)
    const r = await fetch(OWID_WHEAT, {
      headers: {
        accept: 'text/csv',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) VercelEdge/1.0'
      }
    });
    
    if (!r.ok) return fail(502, `OWID wheat ${r.status}`);
    
    const text = await r.text();
    const series = csvToSeries(text, 'World');
    
    // Convert to monthly format and filter last 36 months
    const points = series
      .map(p => ({ 
        date: String(p.date).slice(0, 7), // YYYY-MM format
        value: p.value 
      }))
      .filter(p => p.date && Number.isFinite(p.value))
      .slice(-36); // Last 36 months
    
    return json(points, 24 * 3600);
  } catch (e: any) {
    return fail(500, `Wheat error: ${e?.message || String(e)}`);
  }
}