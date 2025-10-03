const base = ''; // same-origin /api

export async function fetchFFPI() {
  const r = await fetch(`${base}/api/ffpi`); if (!r.ok) throw new Error('FFPI'); return r.json();
}
export async function fetchIMFCPI(series='PCPIF_IX', country='EG', start='2019-01') {
  const r = await fetch(`${base}/api/imf-cpi?country=${country}&series=${series}&start=${start}`); if (!r.ok) throw new Error('IMF'); return r.json();
}
export async function fetchUNHCREgypt() {
  const r = await fetch(`${base}/api/unhcr-egy`); if (!r.ok) throw new Error('UNHCR'); return r.json();
}
export async function fetchWheat() {
  const r = await fetch(`${base}/api/wheat`); if (!r.ok) throw new Error('Wheat'); return r.json();
}
export async function fetchFX() {
  const r = await fetch(`${base}/api/fx`); if (!r.ok) throw new Error('FX'); return r.json();
}
export async function fetchDiet() {
  const r = await fetch(`${base}/api/diet-cost`); if (!r.ok) throw new Error('diet'); return r.json();
}
export async function fetchFIES() {
  const r = await fetch(`${base}/api/fies-egy`); if (!r.ok) throw new Error('fies'); return r.json();
}
export async function fetchCBEInflation() {
  const r = await fetch(`${base}/api/cbe-inflation`); if (!r.ok) throw new Error('CBE inflation'); return r.json();
}
export async function fetchCBEFoodInflation() {
  const r = await fetch(`${base}/api/cbe-food-inflation`); if (!r.ok) throw new Error('CBE food inflation'); return r.json();
}