// Open-Meteo Weather Data Fetcher
// Fetches precipitation and ET0 data for Cairo, Egypt
// Docs: https://open-meteo.com/en/docs/historical-weather-api

export interface WeatherData {
  date: string; // YYYY-MM-DD format
  rain_mm: number;
  et0_mm: number;
  anomaly_mm: number; // et0 - rain
}

export interface WeatherSeries {
  points: WeatherData[];
}

// Cairo coordinates
const CAIRO_LAT = 30.0444;
const CAIRO_LON = 31.2357;
const TIMEZONE = 'Africa/Cairo';

const OPEN_METEO_BASE_URL = 'https://archive-api.open-meteo.com/v1/archive';

/**
 * Fetch weather data for Cairo from Open-Meteo
 * @param days - Number of days to fetch (default: 30)
 */
export async function fetchCairoWeather(days: number = 30): Promise<WeatherSeries> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const params = new URLSearchParams({
    latitude: CAIRO_LAT.toString(),
    longitude: CAIRO_LON.toString(),
    start_date: formatDate(startDate),
    end_date: formatDate(endDate),
    daily: 'precipitation_sum,et0_fao_evapotranspiration',
    timezone: TIMEZONE
  });

  try {
    const response = await fetch(`${OPEN_METEO_BASE_URL}?${params}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'EFB-Dashboard/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return parseWeatherResponse(data);
  } catch (error) {
    console.error('Error fetching Open-Meteo data:', error);
    throw new Error('Failed to fetch weather data');
  }
}

/**
 * Parse Open-Meteo API response
 */
function parseWeatherResponse(response: any): WeatherSeries {
  try {
    const daily = response.daily;
    if (!daily || !daily.time) {
      return { points: [] };
    }

    const times = daily.time;
    const precipitation = daily.precipitation_sum || [];
    const et0 = daily.et0_fao_evapotranspiration || [];

    const points: WeatherData[] = times.map((date: string, index: number) => {
      const rain_mm = precipitation[index] || 0;
      const et0_mm = et0[index] || 0;
      
      return {
        date,
        rain_mm: Math.max(0, rain_mm), // Ensure non-negative
        et0_mm: Math.max(0, et0_mm),   // Ensure non-negative
        anomaly_mm: et0_mm - rain_mm   // Water stress indicator
      };
    });

    return {
      points: points.filter(point => 
        !isNaN(point.rain_mm) && !isNaN(point.et0_mm)
      )
    };
  } catch (error) {
    console.error('Error parsing Open-Meteo response:', error);
    return { points: [] };
  }
}

/**
 * Calculate latest anomaly value and trend
 */
export function getLatestAnomaly(data: WeatherSeries): {
  value: number;
  trend: 'up' | 'down' | 'neutral';
  avgAnomaly: number;
} | null {
  if (data.points.length < 7) return null;

  const recentPoints = data.points.slice(-7); // Last 7 days
  const currentValue = recentPoints[recentPoints.length - 1].anomaly_mm;
  const avgAnomaly = recentPoints.reduce((sum, point) => sum + point.anomaly_mm, 0) / recentPoints.length;

  // Determine trend based on recent 7-day average vs previous 7-day average
  const previousPoints = data.points.slice(-14, -7);
  let trend: 'up' | 'down' | 'neutral' = 'neutral';
  
  if (previousPoints.length === 7) {
    const previousAvg = previousPoints.reduce((sum, point) => sum + point.anomaly_mm, 0) / 7;
    const difference = avgAnomaly - previousAvg;
    
    if (Math.abs(difference) > 2) { // Threshold of 2mm difference
      trend = difference > 0 ? 'up' : 'down';
    }
  }

  return {
    value: currentValue,
    trend,
    avgAnomaly
  };
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Mock data for development/fallback
 */
export function getMockWeatherData(): WeatherSeries {
  const points: WeatherData[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Simulate seasonal patterns (winter has more rain, summer has higher ET0)
    const dayOfYear = getDayOfYear(date);
    const seasonalRain = 5 + Math.sin((dayOfYear - 60) * Math.PI / 182.5) * 3; // Peak in winter
    const seasonalET0 = 8 + Math.sin((dayOfYear - 172) * Math.PI / 182.5) * 4;  // Peak in summer
    
    const rain_mm = Math.max(0, seasonalRain + (Math.random() - 0.5) * 4);
    const et0_mm = Math.max(0, seasonalET0 + (Math.random() - 0.5) * 3);
    
    points.push({
      date: formatDate(date),
      rain_mm: Math.round(rain_mm * 10) / 10,
      et0_mm: Math.round(et0_mm * 10) / 10,
      anomaly_mm: Math.round((et0_mm - rain_mm) * 10) / 10
    });
  }

  return { points };
}

/**
 * Get day of year (1-366)
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}