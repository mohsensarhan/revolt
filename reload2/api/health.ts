export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const origin = new URL(req.url).origin;
  const tests = ['ffpi', 'imf-cpi?country=EG&series=PCPIF_IX', 'unhcr-egy'];

  const results = await Promise.all(tests.map(async t => {
    const url = `${origin}/api/${t}`;
    try {
      const r = await fetch(url, { headers: { accept: 'application/json' } });
      const txt = await r.text();
      return { path: `/api/${t}`, ok: r.ok, status: r.status, body: safeTrim(txt) };
    } catch (e: any) {
      return { path: `/api/${t}`, ok: false, status: 0, body: String(e) };
    }
  }));

  return new Response(JSON.stringify({ ok: results.every(x => x.ok), results }, null, 2), {
    status: 200, headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' }
  });
}

function safeTrim(s: string) { try { return s.length > 300 ? s.slice(0,300)+'…' : s; } catch { return s; } }