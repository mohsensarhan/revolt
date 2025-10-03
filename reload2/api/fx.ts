export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const u = new URL(req.url);
  const base = (u.searchParams.get('base') || 'USD').toUpperCase();
  const sym  = (u.searchParams.get('sym')  || 'EGP').toUpperCase();

  const end   = new Date();
  const start = new Date(end.getTime() - 365*864e5);
  const fmt   = (d:Date)=> d.toISOString().slice(0,10);

  const url = `https://api.exchangerate.host/timeseries?start_date=${fmt(start)}&end_date=${fmt(end)}&base=${base}&symbols=${sym}`;
  try {
    const r = await fetch(url, { headers:{ accept:'application/json','user-agent':'Mozilla/5.0 VercelEdge/1.0' }});
    if (!r.ok) return jsonErr(502, `FX ${r.status}`);
    const j = await r.json();
    const points = Object.entries(j.rates || {})
      .map(([date, obj]: any)=> ({ date, value: Number(obj[sym]) }))
      .filter(p => Number.isFinite(p.value))
      .sort((a,b)=> a.date.localeCompare(b.date));
    return jsonOk({ pair:`${base}/${sym}`, points }, 6*3600);
  } catch (e:any) { return jsonErr(500, `FX error: ${String(e)}`); }
}

function jsonOk(data:unknown, ttl=3600){return new Response(JSON.stringify(data),{status:200,headers:{'content-type':'application/json','cache-control':`public,max-age=${ttl},s-maxage=${ttl}`}})}
function jsonErr(status:number,msg:string){return new Response(JSON.stringify({error:msg}),{status,headers:{'content-type':'application/json'}})}