export const config = { runtime: 'edge' };
import { json, fail } from './_utils.ts';

type Obs = { ['@TIME_PERIOD']: string; ['@OBS_VALUE']: string };
const IMF_BASE = 'https://dataservices.imf.org/REST/SDMX_JSON.svc';

export default async function handler(req: Request) {
  try {
    const u = new URL(req.url);
    const country = (u.searchParams.get('country') || 'EG').toUpperCase();
    const series  = u.searchParams.get('series') || 'PCPIF_IX'; // Food CPI index
    const start   = u.searchParams.get('start')  || '2019-01';

    const url = `${IMF_BASE}/CompactData/CPI/M.${country}.${series}?startPeriod=${start}`;
    const r = await fetch(url, { headers: {
      accept:'application/json',
      'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) VercelEdge/1.0' }});
    if (!r.ok) return fail(502, `IMF ${r.status}`);

    const j = await r.json();
    const s = j?.CompactData?.DataSet?.Series;
    const obs: Obs[] = Array.isArray(s?.Obs) ? s.Obs : (Array.isArray(s) && s[0]?.Obs ? s[0].Obs : []);
    const points = (obs || [])
      .map(o => ({ date: String(o['@TIME_PERIOD']).slice(0,7), value: Number(o['@OBS_VALUE']) }))
      .filter(p => Number.isFinite(p.value));

    return json({ label: series, points }, 24 * 3600);
  } catch (e:any) {
    return fail(500, `IMF error: ${e?.message || String(e)}`);
  }
}