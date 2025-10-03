// World Bank World Development Indicators (WDI) API
// Fetches economic indicators like inflation/CPI data
// Docs: https://datahelpdesk.worldbank.org/knowledgebase/articles/889392

export type WbPoint = { date: string; value: number };

/**
 * Fetch World Bank WDI indicator data
 * @param country - Country code (e.g., 'EGY' for Egypt)
 * @param indicator - WDI indicator code (e.g., 'FP.CPI.TOTL.ZG' for inflation)
 * @returns Array of data points sorted by date
 */
export async function getWbIndicator(country: string, indicator: string): Promise<WbPoint[]> {
  const url = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&per_page=120`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'EFB-Dashboard/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`World Bank API error: ${response.status} ${response.statusText}`);
    }
    
    const json = await response.json();
    
    // World Bank API returns [metadata, data] array
    const dataRows = Array.isArray(json) && json.length > 1 ? json[1] : [];
    
    if (!Array.isArray(dataRows)) {
      console.warn('World Bank API returned unexpected format');
      return [];
    }
    
    return dataRows
      .filter((row: any) => row?.value !== null && row?.date && !isNaN(Number(row.value)))
      .map((row: any) => ({
        date: String(row.date),
        value: Number(row.value)
      }))
      .sort((a: WbPoint, b: WbPoint) => a.date.localeCompare(b.date));
      
  } catch (error) {
    console.error('Error fetching World Bank data:', error);
    throw new Error('Failed to fetch World Bank indicator data');
  }
}

/**
 * Fetch Egypt CPI YoY inflation data
 */
export async function getEgyptCpiYoY(): Promise<WbPoint[]> {
  return getWbIndicator('EGY', 'FP.CPI.TOTL.ZG');
}