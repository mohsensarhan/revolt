// World Bank Commodity Data Fetcher  
// Phase 2: Will fetch from WB Pink Sheet via proxy
// Phase 1: Returns mock data with proper structure

export interface CommodityData {
  date: string; // YYYY-MM format
  value: number;
}

export interface CommoditySeries {
  label: 'wheat' | 'vegOils' | 'sugar' | 'fertilizers';
  unit: string;
  points: CommodityData[];
}

export interface WorldBankCommodities {
  ffpi?: CommodityData[];  // FAO Food Price Index
  wheat?: CommoditySeries;
  vegOils?: CommoditySeries;
  sugar?: CommoditySeries;
  fertilizers?: CommoditySeries;
}

/**
 * Fetch commodity data (Phase 2 implementation)
 * Currently returns mock data, will be replaced with API calls to /api/commod-wb
 */
export async function fetchWorldBankCommodities(): Promise<WorldBankCommodities> {
  // Phase 2: Replace with actual API calls
  // const response = await fetch('/api/commod-wb');
  // const data = await response.json();
  // return parseWorldBankResponse(data);
  
  // Phase 1: Return mock data
  console.warn('Using mock World Bank commodity data - Phase 2 implementation pending');
  return getMockCommodityData();
}

/**
 * Fetch FFPI data (Phase 2 implementation)
 */
export async function fetchFFPI(): Promise<CommodityData[]> {
  // Phase 2: Replace with actual API call
  // const response = await fetch('/api/ffpi');
  // const data = await response.json();
  // return parseFFPIResponse(data);
  
  // Phase 1: Return mock FFPI data
  console.warn('Using mock FFPI data - Phase 2 implementation pending');
  return getMockFFPIData();
}

/**
 * Calculate monthly change for commodity series
 */
export function calculateCommodityMoM(data: CommodityData[]): number | undefined {
  if (data.length < 2) return undefined;
  
  const latest = data[data.length - 1];
  const previous = data[data.length - 2];
  
  return ((latest.value / previous.value) - 1) * 100;
}

/**
 * Mock FFPI data for Phase 1
 */
function getMockFFPIData(): CommodityData[] {
  const data: CommodityData[] = [];
  const now = new Date();
  
  // Base FFPI around 120-140 range (2014-2016=100 baseline)
  let baseValue = 125;
  
  for (let i = 23; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    // Simulate volatility with upward trend
    const monthlyChange = (Math.random() - 0.48) * 8; // Slight upward bias
    baseValue += monthlyChange;
    baseValue = Math.max(100, baseValue); // Floor at 100
    
    data.push({
      date: formatYearMonth(date),
      value: Math.round(baseValue * 10) / 10
    });
  }
  
  return data;
}

/**
 * Mock commodity data for Phase 1
 */
function getMockCommodityData(): WorldBankCommodities {
  const now = new Date();
  
  const generateCommodityPoints = (basePrice: number, volatility: number): CommodityData[] => {
    const points: CommodityData[] = [];
    let currentPrice = basePrice;
    
    for (let i = 23; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      
      // Add some realistic price movement
      const change = (Math.random() - 0.5) * volatility;
      currentPrice += change;
      currentPrice = Math.max(basePrice * 0.5, currentPrice); // Prevent negative prices
      
      points.push({
        date: formatYearMonth(date),
        value: Math.round(currentPrice * 100) / 100
      });
    }
    
    return points;
  };
  
  return {
    ffpi: getMockFFPIData(),
    wheat: {
      label: 'wheat',
      unit: 'USD/MT',
      points: generateCommodityPoints(320, 25) // Wheat around $320/MT
    },
    vegOils: {
      label: 'vegOils',
      unit: 'USD/MT',
      points: generateCommodityPoints(1180, 80) // Veg oils around $1180/MT
    },
    sugar: {
      label: 'sugar',
      unit: 'USD/kg',
      points: generateCommodityPoints(0.42, 0.05) // Sugar around $0.42/kg
    },
    fertilizers: {
      label: 'fertilizers',
      unit: 'USD/MT',
      points: generateCommodityPoints(280, 30) // Fertilizers around $280/MT
    }
  };
}

/**
 * Format date as YYYY-MM
 */
function formatYearMonth(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Format commodity value for display
 */
export function formatCommodityValue(value: number, unit: string): string {
  if (unit.includes('/kg')) {
    return value.toFixed(3);
  } else if (unit.includes('/MT') || unit.includes('/ton')) {
    return Math.round(value).toString();
  }
  return value.toFixed(1);
}

/**
 * Get commodity trend based on recent price movement
 */
export function getCommodityTrend(points: CommodityData[]): 'up' | 'down' | 'neutral' {
  if (points.length < 3) return 'neutral';
  
  const recent = points.slice(-3);
  const first = recent[0].value;
  const last = recent[recent.length - 1].value;
  const change = (last / first - 1) * 100;
  
  if (Math.abs(change) < 2) return 'neutral';
  return change > 0 ? 'up' : 'down';
}