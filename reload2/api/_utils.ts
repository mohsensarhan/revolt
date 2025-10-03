// SECURITY: Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'http://localhost:8084',
  'http://localhost:5173',
  'https://yourdomain.com' // Replace with your production domain
];

function getCorsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get('origin') || '';
  const corsHeaders: Record<string, string> = {};

  if (ALLOWED_ORIGINS.includes(origin)) {
    corsHeaders['access-control-allow-origin'] = origin;
    corsHeaders['access-control-allow-credentials'] = 'true';
  }

  return corsHeaders;
}

export const json = (data: unknown, ttl = 3600, request?: Request) =>
  new Response(JSON.stringify(data), { status: 200, headers: {
    'content-type':'application/json; charset=utf-8',
    'cache-control':`public, max-age=${ttl}, s-maxage=${ttl}`,
    ...getCorsHeaders(request)
  }});

export const fail = (status:number, msg:string, request?: Request) =>
  new Response(JSON.stringify({error:msg}), { status, headers:{
    'content-type':'application/json; charset=utf-8',
    ...getCorsHeaders(request)
  }});

// CSV parser (handles quotes/commas)
export function parseCsv(t:string){const r:string[][]=[];let c='',q=false,row:string[]=[];
for(let i=0;i<t.length;i++){const ch=t[i];if(ch=='"'){q=!q;continue;}
if(ch=='\n'&&!q){row.push(c);r.push(row);row=[];c='';continue;}
if(ch==','&&!q){row.push(c);c='';continue;} c+=ch;} if(c.length||row.length){row.push(c);r.push(row);} return r;}

export function csvToSeries(text:string,entity?:string){
  const lines=parseCsv(text).filter(x=>x.length); if(!lines.length)return[];
  const headers=lines[0].map(h=>h.trim()); const idx=(n:string)=>headers.findIndex(h=>h.toLowerCase()==n.toLowerCase());
  const iE=idx('Entity'), iY=idx('Year'); let iV=idx('Value'); if(iV<0) iV=headers.length-1;
  const data=lines.slice(1).filter(r=>r.length===headers.length);
  const filtered=(typeof entity==='string'&&iE>=0)?data.filter(r=>r[iE]===entity):data;
  return filtered.map(r=>({date:r[iY]??r[0], value:Number(r[iV])}))
    .filter(p=>p.date && Number.isFinite(p.value))
    .sort((a,b)=>String(a.date).localeCompare(String(b.date)));
}