// IMF SDMX CPI Data Fetcher
// Fetches Egypt CPI data from IMF SDMX API
// Docs: https://datahelp.imf.org/knowledgebase/articles/667681-using-json-restful-web-service

export interface IMFCPIData {
  date: string; // YYYY-MM format
  value: number;
}

export interface IMFCPISeries {
  headline?: IMFCPIData[];
  food?: IMFCPIData[];
}

const IMF_BASE_URL = 'https://dataservices.imf.org/REST/SDMX_JSON.svc/CompactData';

// CPI dataset indicators
const CPI_INDICATORS = {
  HEADLINE: 'PCPI_IX',     // Overall CPI
  FOOD: 'PCPIF_IX'         // Food & Non-alcoholic beverages
};

/**
 * Fetch Egypt CPI data from IMF SDMX API
 * @param startPeriod - Start period in YYYY-MM format
 * @param endPeriod - End period in YYYY-MM format (optional, defaults to current)
 */
export async function fetchIMFCPI(
  startPeriod?: string, 
  endPeriod?: string
): Promise<IMFCPISeries> {
  const currentDate = new Date();
  const defaultStart = startPeriod || getMonthsAgo(24);
  const defaultEnd = endPeriod || formatYearMonth(currentDate);
  
  try {
    // Fetch both headline and food CPI
    const [headlineResponse, foodResponse] = await Promise.all([
      fetchCPIIndicator(CPI_INDICATORS.HEADLINE, defaultStart, defaultEnd),
      fetchCPIIndicator(CPI_INDICATORS.FOOD, defaultStart, defaultEnd)
    ]);

    return {
      headline: headlineResponse,
      food: foodResponse
    };
  } catch (error) {
    console.error('Error fetching IMF CPI data:', error);
    throw new Error('Failed to fetch IMF CPI data');
  }
}

/**
 * Fetch single CPI indicator
 */
async function fetchCPIIndicator(
  indicator: string, 
  startPeriod: string, 
  endPeriod: string
): Promise<IMFCPIData[]> {
  const url = `${IMF_BASE_URL}/CPI/M.EG.${indicator}?startPeriod=${startPeriod}&endPeriod=${endPeriod}`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'EFB-Dashboard/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`IMF API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return parseIMFResponse(data);
}

/**
 * Parse IMF SDMX JSON response
 */
function parseIMFResponse(response: any): IMFCPIData[] {
  try {
    const series = response?.CompactData?.DataSet?.Series;
    if (!series) {
      return [];
    }

    const observations = Array.isArray(series) ? series[0]?.Obs : series?.Obs;
    if (!observations) {
      return [];
    }

    const obsArray = Array.isArray(observations) ? observations : [observations];
    
    return obsArray
      .map((obs: any) => ({
        date: obs['@TIME_PERIOD'],
        value: parseFloat(obs['@OBS_VALUE'])
      }))
      .filter((item: IMFCPIData) => !isNaN(item.value))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error parsing IMF response:', error);
    return [];
  }
}

/**
 * Calculate month-over-month change
 */
export function calculateMoMChange(data: IMFCPIData[]): number | undefined {
  if (data.length < 2) return undefined;
  
  const latest = data[data.length - 1];
  const previous = data[data.length - 2];
  
  return ((latest.value / previous.value) - 1) * 100;
}

/**
 * Get date string for months ago
 */
function getMonthsAgo(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return formatYearMonth(date);
}

/**
 * Format date as YYYY-MM
 */
function formatYearMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Mock data for development/fallback
 */
export function getMockIMFCPI(): IMFCPISeries {
  const now = new Date();
  const mockData: IMFCPIData[] = [];
  
  // Generate 24 months of mock data
  for (let i = 23; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    mockData.push({
      date: formatYearMonth(date),
      value: 100 + (Math.random() * 50) + (i * 2) // Trending upward with volatility
    });
  }

  return {
    headline: mockData,
    food: mockData.map(item => ({
      ...item,
      value: item.value * 1.2 + (Math.random() * 10) // Food CPI typically higher
    }))
  };
}