// Use Vite-friendly envs; process.env may be undefined in Vite builds.
const MODE = (import.meta as any)?.env?.MODE ?? (typeof process !== 'undefined' ? (process as any)?.env?.NODE_ENV : 'production');
const host = typeof window !== 'undefined' ? window.location.hostname : '';

// Detect preview-like hosts (Lovable/Netlify/Vercel/etc.)
const isPreviewHost = /lovable|preview|vercel\.app|netlify\.app|onrender\.com|webcontainer|stackblitz/i.test(host);

// ***** LIVE DATA ENABLED *****
// Safe sources enabled for live data (CORS-friendly)
export const FORCE_MOCK = false;

export const DATA_SOURCE = {
  openmeteo: 'live',  // ET₀ anomaly (direct)
  wb:        'live',  // CPI YoY (direct) - DEPRECATED, replaced by CBE
  cbe:       'live',  // NEW: Egypt inflation via /api/cbe-inflation (Central Bank of Egypt)
  cbeFood:   'live',  // NEW: CBE food inflation via /api/cbe-food-inflation (Fruits & Vegetables)
  ffpi:      'live',  // FAO via /api/ffpi
  imf:       'live',  // Food CPI via /api/imf-cpi (with headline fallback)
  unhcr:     'live',  // via /api/unhcr-egy (with OWID fallback)
  wheat:     'live',  // via /api/wheat
  fx:        'live',  // NEW: USD/EGP via /api/fx
  diet:      'live',  // NEW: Cost of healthy diet via /api/diet-cost
  fies:      'live',  // NEW: Food insecurity (FIES) via /api/fies-egy
} as const;

// Safe DEV check for logging
export const IS_DEV = MODE !== 'production' || isPreviewHost;