export const json = (data, ttl = 3600) =>
  new Response(JSON.stringify(data), { status: 200, headers: {
    'content-type':'application/json; charset=utf-8',
    'cache-control':`public, max-age=${ttl}, s-maxage=${ttl}`,
    'access-control-allow-origin':'*'
  }});

export const fail = (status, msg) =>
  new Response(JSON.stringify({error:msg}), { status, headers:{
    'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*'
  }});

// CSV parser (handles quotes/commas)
export function parseCsv(t){const r=[];let c='',q=false,row=[];
for(let i=0;i<t.length;i++){const ch=t[i];if(ch=='"'){q=!q;continue;}
if(ch=='\n'&&!q){row.push(c);r.push(row);row=[];c='';continue;}
if(ch==','&&!q){row.push(c);c='';continue;} c+=ch;} if(c.length||row.length){row.push(c);r.push(row);} return r;}

export function csvToSeries(text,entity){
  const lines=parseCsv(text).filter(x=>x.length); if(!lines.length)return[];
  const headers=lines[0].map(h=>h.trim()); const idx=(n)=>headers.findIndex(h=>h.toLowerCase()==n.toLowerCase());
  const iE=idx('Entity'), iY=idx('Year'); let iV=idx('Value'); if(iV<0) iV=headers.length-1;
  const data=lines.slice(1).filter(r=>r.length===headers.length);
  const filtered=(typeof entity==='string'&&iE>=0)?data.filter(r=>r[iE]===entity):data;
  return filtered.map(r=>({date:r[iY]??r[0], value:Number(r[iV])}))
    .filter(p=>p.date && Number.isFinite(p.value))
    .sort((a,b)=>String(a.date).localeCompare(String(b.date)));
}