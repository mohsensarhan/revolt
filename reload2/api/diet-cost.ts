export const config = { runtime: 'edge' };

export default async function handler() {
  try {
    const r = await fetch('https://ourworldindata.org/grapher/cost-healthy-diet.csv',
      { headers:{accept:'text/csv','user-agent':'Mozilla/5.0 VercelEdge/1.0'} });
    if (!r.ok) return err(502, `OWID diet ${r.status}`);
    const text = await r.text();
    const lines = text.trim().split('\n'); if (!lines.length) return ok([], 3600);
    const hdr = lines[0].split(','), iEnt=hdr.indexOf('Entity'), iYear=hdr.indexOf('Year'), iVal=hdr.length-1;
    const points = lines.slice(1).map(l=>l.split(','))
      .filter(c=>c[iEnt]==='Egypt' && c[iVal] !== '')
      .map(c=>({ date: c[iYear], value: Number(c[iVal]) }))
      .filter(p=>Number.isFinite(p.value))
      .sort((a,b)=> a.date.localeCompare(b.date));
    return ok(points, 7*24*3600);
  } catch(e:any){ return err(500, `diet error: ${String(e)}`); }
}
function ok(d:unknown,ttl=3600){return new Response(JSON.stringify(d),{status:200,headers:{'content-type':'application/json','cache-control':`public,max-age=${ttl},s-maxage=${ttl}`}})}
function err(s:number,m:string){return new Response(JSON.stringify({error:m}),{status:s,headers:{'content-type':'application/json'}})}