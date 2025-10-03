// UNHCR Refugee Statistics API Fetcher
// Fetches refugee population data for Egypt
// Docs: https://api.unhcr.org/

export interface RefugeeData {
  year: number;
  count: number;
}

export interface RefugeeSeries {
  points: RefugeeData[];
}

const UNHCR_BASE_URL = 'https://api.unhcr.org/population/v1';

/**
 * Fetch refugee statistics for Egypt from UNHCR API
 */
export async function fetchEgyptRefugees(): Promise<RefugeeSeries> {
  try {
    const response = await fetch(`${UNHCR_BASE_URL}/summary?dataset=pop&year=all&coa=EGY`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'EFB-Dashboard/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`UNHCR API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return parseUNHCRResponse(data);
  } catch (error) {
    console.error('Error fetching UNHCR data:', error);
    throw new Error('Failed to fetch refugee data');
  }
}

/**
 * Parse UNHCR API response
 */
function parseUNHCRResponse(response: any): RefugeeSeries {
  try {
    const data = response.data;
    if (!Array.isArray(data)) {
      return { points: [] };
    }

    // Aggregate by year and sum all refugee categories
    const yearlyData: { [key: number]: number } = {};

    data.forEach((record: any) => {
      const year = parseInt(record.year);
      if (isNaN(year) || year < 2010) return; // Only last ~14 years

      // Sum refugees, asylum seekers, and other persons of concern
      const refugees = parseInt(record.refugees) || 0;
      const asylumSeekers = parseInt(record.asylum_seekers) || 0;
      const others = parseInt(record.others_of_concern) || 0;
      
      const total = refugees + asylumSeekers + others;

      if (total > 0) {
        yearlyData[year] = (yearlyData[year] || 0) + total;
      }
    });

    // Convert to array and sort by year
    const points: RefugeeData[] = Object.entries(yearlyData)
      .map(([year, count]) => ({
        year: parseInt(year),
        count
      }))
      .sort((a, b) => a.year - b.year);

    return { points };
  } catch (error) {
    console.error('Error parsing UNHCR response:', error);
    return { points: [] };
  }
}

/**
 * Calculate year-over-year change
 */
export function calculateYoYChange(data: RefugeeSeries): number | undefined {
  if (data.points.length < 2) return undefined;
  
  const latest = data.points[data.points.length - 1];
  const previous = data.points[data.points.length - 2];
  
  if (previous.count === 0) return undefined;
  
  return ((latest.count / previous.count) - 1) * 100;
}

/**
 * Get latest refugee count with formatting
 */
export function getLatestCount(data: RefugeeSeries): {
  count: number;
  year: number;
  formattedCount: string;
} | null {
  if (data.points.length === 0) return null;
  
  const latest = data.points[data.points.length - 1];
  
  return {
    count: latest.count,
    year: latest.year,
    formattedCount: formatRefugeeCount(latest.count)
  };
}

/**
 * Format refugee count for display (e.g., "284K", "1.2M")
 */
function formatRefugeeCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${Math.round(count / 1000)}K`;
  }
  return count.toString();
}

/**
 * Mock data for development/fallback
 */
export function getMockRefugeeData(): RefugeeSeries {
  const currentYear = new Date().getFullYear();
  const points: RefugeeData[] = [];
  
  // Generate 10 years of mock data with realistic growth pattern
  let baseCount = 150000; // Starting at ~150K refugees
  
  for (let i = 9; i >= 0; i--) {
    const year = currentYear - i;
    
    // Simulate gradual increase with some volatility
    // Bigger increases in recent years due to regional conflicts
    const growthRate = i <= 3 ? 0.15 : 0.08; // Higher growth in recent years
    const volatility = (Math.random() - 0.5) * 0.1; // ±5% random variation
    
    baseCount = Math.round(baseCount * (1 + growthRate + volatility));
    
    points.push({
      year,
      count: baseCount
    });
  }
  
  return { points };
}