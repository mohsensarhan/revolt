// Our World in Data (OWID) "grapher CSV" fetcher
// Fetches data from OWID charts that support CSV export
// All OWID chart URLs work with .csv suffix (CORS-friendly)

export type OwidPoint = { date: string; value: number };

// Safe CSV split (handles quotes)
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '', inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQuotes = !inQuotes; continue; }
    if (c === ',' && !inQuotes) { out.push(cur); cur = ''; }
    else { cur += c; }
  }
  out.push(cur);
  return out;
}

export async function getOwidSeries(slug: string, entity: string): Promise<OwidPoint[]> {
  const url = `https://ourworldindata.org/grapher/${slug}.csv`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OWID fetch failed: ${slug}`);
  const text = await res.text();

  const lines = text.trim().split('\n');
  if (!lines.length) return [];

  const headers = splitCsvLine(lines[0]).map(h => h.trim());
  const idx = (name: string) => headers.findIndex(h => h.toLowerCase() === name.toLowerCase());

  const iEntity = idx('Entity');
  const iYear   = idx('Year');

  // Preferred order: 'Value' -> exact slug -> last column
  let iValue = idx('Value');
  if (iValue < 0) iValue = headers.findIndex(h => h === slug);
  if (iValue < 0) iValue = headers.length - 1;

  if (iEntity < 0 || iYear < 0 || iValue < 0) return [];

  const rows = lines.slice(1).map(splitCsvLine);
  const out = rows
    .filter(cols => cols[iEntity] === entity && cols[iValue] !== '' && cols[iValue] != null)
    .map(cols => ({ date: cols[iYear], value: Number(cols[iValue]) }))
    .filter(p => Number.isFinite(p.value))
    .sort((a, b) => a.date.localeCompare(b.date));

  return out;
}

/**
 * Fetch Egypt refugees data from OWID
 */
export async function getEgyptRefugees(): Promise<OwidPoint[]> {
  return getOwidSeries('refugee-population-by-country-or-territory-of-asylum', 'Egypt');
}

/**
 * Fetch Egypt food insecurity (FIES) data from OWID
 */
export async function getEgyptFoodInsecurity(): Promise<OwidPoint[]> {
  return getOwidSeries('share-of-population-with-moderate-or-severe-food-insecurity', 'Egypt');
}

/**
 * Fetch Egypt healthy diet cost data from OWID
 */
export async function getEgyptDietCost(): Promise<OwidPoint[]> {
  return getOwidSeries('cost-healthy-diet', 'Egypt');
}