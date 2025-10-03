export const config = { runtime: 'edge' };
import { json, fail, csvToSeries } from './_utils.ts';

// Fetch FAO FFPI page and extract the monthly CSV link
const FFPI_PAGE = 'https://www.fao.org/worldfoodsituation/foodpricesindex/en/';

export default async function handler() {
  try {
    const page = await fetch(FFPI_PAGE, {
      headers: { accept:'text/html',
        'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) VercelEdge/1.0' }
    });
    if (!page.ok) return fail(502, `FAO page ${page.status}`);
    const html = await page.text();
    let m = html.match(/href="([^"]+\.csv[^"]*)"[^>]*>\s*CSV:[^<]*Nominal indices[^<]*monthly/i);
    if (!m) m = html.match(/href="([^"]+\.csv[^"]*)"/i);
    if (!m) return fail(502, 'FFPI CSV link not found on FAO page');

    const csvUrl = new URL(m[1], FFPI_PAGE).toString();
    const r = await fetch(csvUrl, { headers: { accept:'text/csv',
      'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) VercelEdge/1.0' }});
    if (!r.ok) return fail(502, `FAO CSV ${r.status}`);
    const text = await r.text();

    const series = csvToSeries(text);
    const points = series.map(p => ({ date: String(p.date).slice(0,7), value: p.value }));
    return json(points, 24 * 3600);
  } catch (e:any) {
    return fail(500, `FFPI error: ${e?.message || String(e)}`);
  }
}