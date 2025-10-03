export const config = { runtime: 'edge' };
import { json, fail } from './_utils.ts';

const URL_UNHCR = 'https://api.unhcr.org/population/v1/summary?dataset=pop&year=all&coa=EGY';
// OWID fallback (browser-safe mirror of UNHCR)
const URL_OWID = 'https://ourworldindata.org/grapher/refugee-population-by-country-or-territory-of-asylum.csv';

export default async function handler() {
  try {
    // 1) Try UNHCR official API
    const r = await fetch(URL_UNHCR, {
      headers: {
        accept: 'application/json',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) VercelEdge/1.0'
      }
    });
    if (r.ok) {
      const j = await r.json();
      const rows = j?.data ?? j?.results ?? [];
      const series = rows.map((x:any) => ({
        year: Number(x.year ?? x.Year),
        count: Number(x.value ?? x.Value ?? x.population)
      }))
      .filter(d => d.year && Number.isFinite(d.count))
      .sort((a, b) => a.year - b.year);
      return json(series, 7 * 24 * 3600);
    }

    // 2) Fallback to OWID CSV mirror (filter Egypt)
    const csv = await fetch(URL_OWID, { headers:{ accept:'text/csv',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) VercelEdge/1.0' }});
    if (!csv.ok) return fail(502, `UNHCR ${r.status}; OWID ${csv.status}`);
    const text = await csv.text();
    const lines = text.trim().split('\n');
    const hdr = lines[0].split(',');
    const iEnt = hdr.indexOf('Entity'); const iYear = hdr.indexOf('Year'); const iVal = hdr.length - 1;
    const series = lines.slice(1)
      .map(row => row.split(','))
      .filter(c => c[iEnt] === 'Egypt' && c[iYear] && c[iVal] !== '')
      .map(c => ({ year:Number(c[iYear]), count:Number(c[iVal]) }))
      .filter(d => d.year && Number.isFinite(d.count))
      .sort((a,b) => a.year - b.year);
    return json(series, 7 * 24 * 3600);
  } catch (e:any) {
    return fail(500, `UNHCR error: ${e?.message || String(e)}`);
  }
}