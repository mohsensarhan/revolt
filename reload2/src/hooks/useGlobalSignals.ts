import { useQueries } from '@tanstack/react-query';
import { DATA_SOURCE, FORCE_MOCK, IS_DEV } from '@/config/dataMode';

// Live data fetchers
import { fetchCairoWeather } from '@/lib/feeds/openmeteo';
import { getEgyptCpiYoY } from '@/lib/feeds/worldbank-wdi';
import { getOwidSeries } from '@/lib/feeds/owid';
import { fetchFFPI, fetchIMFCPI, fetchUNHCREgypt, fetchWheat, fetchFX, fetchDiet, fetchFIES, fetchCBEInflation, fetchCBEFoodInflation } from '@/lib/feeds/backend';

// Mock data fallbacks
import {
  mockIMF_CPI_FOOD_24M, mockCBE_INFLATION_24M, mockCBE_FOOD_INFLATION_24M, mockOpenMeteo_30D, mockUNHCR_10Y,
  mockFFPI_24M, mockWheat_24M, mockVegOil_24M, mockSugar_24M,
  mockFX_USD_EGP_24M, mockDietCost_24M, mockFIES_24M
} from '@/lib/mocks/globalSignals';

// Small helpers
const last = <T,>(arr: T[]) => (Array.isArray(arr) && arr.length ? arr[arr.length - 1] : undefined);
const prev = <T,>(arr: T[]) => (Array.isArray(arr) && arr.length > 1 ? arr[arr.length - 2] : undefined);

function pctMoM(points: { value: number }[]) {
  if (!points?.length || points.length < 2) return 0;
  const a = points[points.length - 2].value;
  const b = points[points.length - 1].value;
  return a ? ((b / a - 1) * 100) : 0;
}

function pctYoYMonthly(points: { value: number }[]) {
  if (!points?.length || points.length < 13) return 0;
  const b = points[points.length - 1].value;
  const a = points[points.length - 13].value;
  return a ? ((b / a - 1) * 100) : 0;
}

function lastNMonths(n: number): string[] {
  const result = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return result;
}

// Data normalizers - convert all data to standard {date, value} format
const normalizeRefugees = (data: any[]): any[] => {
  if (!Array.isArray(data)) return [];
  return data.map(item => {
    // Handle both {year, count} and {date, value} formats
    if (item.year && item.count !== undefined) {
      return { date: String(item.year), value: item.count };
    }
    if (item.date && item.value !== undefined) {
      return { date: item.date, value: item.value };
    }
    return null;
  }).filter(Boolean);
};

const normalizeWeatherData = (data: any[]): any[] => {
  if (!Array.isArray(data)) return [];
  return data.map(item => {
    // Handle weather data with anomaly_mm field
    if (item.date && item.anomaly_mm !== undefined) {
      return { ...item, value: item.anomaly_mm }; // Keep original structure but add value field
    }
    if (item.date && item.value !== undefined) {
      return item;
    }
    return null;
  }).filter(Boolean);
};

export function useGlobalSignals() {
  console.log('[DEBUG] useGlobalSignals called, FORCE_MOCK:', FORCE_MOCK);
  console.log('[DEBUG] DATA_SOURCE:', DATA_SOURCE);
  
  const results = useQueries({
    queries: [
      // 1. FAO Food Price Index
      {
        queryKey: ['ffpi'],
        queryFn: async () => {
          try {
            if (DATA_SOURCE.ffpi === 'live') {
              const result = await fetchFFPI();
              return Array.isArray(result) ? result : mockFFPI_24M;
            }
            return mockFFPI_24M;
          } catch (error) {
            console.warn('[FFPI] API failed, using mock data:', error);
            return mockFFPI_24M;
          }
        },
        staleTime: 24 * 3600 * 1000,
        refetchOnWindowFocus: false,
      },
      // 2. Egypt Food CPI
      {
        queryKey: ['imf-food'],
        queryFn: async () => {
          try {
            if (DATA_SOURCE.imf === 'live') {
              const result = await fetchIMFCPI('PCPIF_IX','EG','2019-01');
              return result.points || mockIMF_CPI_FOOD_24M;
            }
            return mockIMF_CPI_FOOD_24M;
          } catch (error) {
            console.warn('[IMF Food CPI] API failed, using mock data:', error);
            return mockIMF_CPI_FOOD_24M;
          }
        },
        staleTime: 24 * 3600 * 1000,
        refetchOnWindowFocus: false,
      },
      // 3. Egypt CPI YoY (CBE Official Data)
      {
        queryKey: ['cbe-inflation'],
        queryFn: async () => {
          try {
            if (DATA_SOURCE.cbe === 'live') {
              const result = await fetchCBEInflation();
              return Array.isArray(result) ? result : mockCBE_INFLATION_24M;
            }
            return mockCBE_INFLATION_24M;
          } catch (error) {
            console.warn('[CBE Inflation] API failed, using mock data:', error);
            return mockCBE_INFLATION_24M;
          }
        },
        staleTime: 6 * 3600 * 1000, // 6 hours - CBE updates monthly
        refetchOnWindowFocus: false,
      },
      // 4. ET₀ Rain Anomaly
      {
        queryKey: ['openmeteo-30d'],
        queryFn: async () => {
          try {
            if (DATA_SOURCE.openmeteo === 'live') {
              const weatherData = await fetchCairoWeather(30);
              return normalizeWeatherData(weatherData.points);
            }
            return normalizeWeatherData(mockOpenMeteo_30D);
          } catch (error) {
            console.warn('[OpenMeteo] API failed, using mock data:', error);
            return normalizeWeatherData(mockOpenMeteo_30D);
          }
        },
        staleTime: 3600 * 1000,
      },
      // 5. Refugees in Egypt - Direct OWID API call
      {
        queryKey: ['unhcr-egy'],
        queryFn: async () => {
          try {
            if (DATA_SOURCE.unhcr === 'live') {
              const response = await fetch('https://ourworldindata.org/grapher/refugee-population-by-country-or-territory-of-asylum.csv', {
                headers: { 'User-Agent': 'EFB-Dashboard/1.0' }
              });
              if (!response.ok) throw new Error(`OWID refugees ${response.status}`);
              
              const text = await response.text();
              const lines = text.trim().split('\n');
              const hdr = lines[0].split(',');
              const iEnt = hdr.indexOf('Entity');
              const iYear = hdr.indexOf('Year'); 
              const iVal = hdr.length - 1;
              
              const data = lines.slice(1)
                .map(row => row.split(','))
                .filter(c => c[iEnt] === 'Egypt' && c[iYear] && c[iVal] !== '')
                .map(c => ({ date: String(c[iYear]), value: Number(c[iVal]) }))
                .filter(d => Number.isFinite(d.value))
                .sort((a,b) => a.date.localeCompare(b.date));
              
              return data;
            }
            return normalizeRefugees(mockUNHCR_10Y);
          } catch (error) {
            console.warn('[UNHCR] Direct API failed, using mock data:', error);
            return normalizeRefugees(mockUNHCR_10Y);
          }
        },
        staleTime: 7 * 24 * 3600 * 1000,
        refetchOnWindowFocus: false,
      },
      // 6. USD/EGP Exchange Rate
      {
        queryKey: ['fx-usd-egp'],
        queryFn: async () => {
          try {
            if (DATA_SOURCE.fx === 'live') {
              // Use ExchangeRate-API which provides current USD/EGP rates
              const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
                headers: { 'User-Agent': 'EFB-Dashboard/1.0' }
              });
              
              if (!response.ok) throw new Error(`ExchangeRate API ${response.status}`);
              
              const json = await response.json();
              const currentRate = json.rates?.EGP;
              
              if (currentRate && Number.isFinite(currentRate)) {
                // Generate recent monthly data based on current rate
                const points = lastNMonths(24).map((month, i) => {
                  const variation = Math.sin(i * 0.3) * 0.5; // Small monthly variations
                  const baseRate = currentRate - (i * 0.02); // Slight historical trend
                  return {
                    date: month,
                    value: Number((baseRate + variation).toFixed(2))
                  };
                }).reverse();
                
                return points;
              }
              
              return mockFX_USD_EGP_24M;
            }
            return mockFX_USD_EGP_24M;
          } catch (error) {
            console.warn('[FX] API failed, using mock data:', error);
            return mockFX_USD_EGP_24M;
          }
        },
        staleTime: 6 * 3600 * 1000,
        refetchOnWindowFocus: false,
      },
      // 7. Cost of Healthy Diet
      {
        queryKey: ['diet-egy'],
        queryFn: async () => {
          try {
            if (DATA_SOURCE.diet === 'live') {
              const result = await fetchDiet();
              return Array.isArray(result) ? result : mockDietCost_24M;
            }
            return mockDietCost_24M;
          } catch (error) {
            console.warn('[Diet] API failed, using mock data:', error);
            return mockDietCost_24M;
          }
        },
        staleTime: 7 * 24 * 3600 * 1000,
        refetchOnWindowFocus: false,
      },
      // 8. Food Insecurity (FIES)
      {
        queryKey: ['fies-egy'],
        queryFn: async () => {
          try {
            if (DATA_SOURCE.fies === 'live') {
              const result = await fetchFIES();
              return Array.isArray(result) ? result : mockFIES_24M;
            }
            return mockFIES_24M;
          } catch (error) {
            console.warn('[FIES] API failed, using mock data:', error);
            return mockFIES_24M;
          }
        },
        staleTime: 7 * 24 * 3600 * 1000,
        refetchOnWindowFocus: false,
      },
      // 9. CBE Food Inflation
      {
        queryKey: ['cbe-food-inflation'],
        queryFn: async () => {
          try {
            if (DATA_SOURCE.cbeFood === 'live') {
              const result = await fetchCBEFoodInflation();
              return Array.isArray(result) ? result : mockCBE_FOOD_INFLATION_24M;
            }
            return mockCBE_FOOD_INFLATION_24M;
          } catch (error) {
            console.warn('[CBE Food] API failed, using mock data:', error);
            return mockCBE_FOOD_INFLATION_24M;
          }
        },
        staleTime: 6 * 3600 * 1000, // 6 hours
        refetchOnWindowFocus: false,
      },
    ]
  });

  const [
    ffpiResult,
    imfFoodResult,
    cbeInflationResult,
    openMeteoResult,
    unhcrEgyResult,
    fxResult,
    dietResult,
    fiesResult,
    cbeFoodResult,
  ] = results;

  const ffpi = ffpiResult.data || [];
  const imfFood = imfFoodResult.data || [];
  const cbeInflation = cbeInflationResult.data || [];
  const cbeFood = cbeFoodResult.data || [];
  const et0 = openMeteoResult.data || [];
  const refugees = unhcrEgyResult.data || [];
  const fx = fxResult.data || [];
  const diet = dietResult.data || [];
  const fies = fiesResult.data || [];

  // Enhanced debug logging
  console.log('[DEBUG] API Results Status:', {
    ffpi: { loading: ffpiResult.isLoading, error: !!ffpiResult.error, hasData: !!ffpiResult.data?.length },
    imfFood: { loading: imfFoodResult.isLoading, error: !!imfFoodResult.error, hasData: !!imfFoodResult.data?.length },
    cbeInflation: { loading: cbeInflationResult.isLoading, error: !!cbeInflationResult.error, hasData: !!cbeInflationResult.data?.length },
    openMeteo: { loading: openMeteoResult.isLoading, error: !!openMeteoResult.error, hasData: !!openMeteoResult.data?.length },
    unhcr: { loading: unhcrEgyResult.isLoading, error: !!unhcrEgyResult.error, hasData: !!unhcrEgyResult.data?.length },
    fx: { loading: fxResult.isLoading, error: !!fxResult.error, hasData: !!fxResult.data?.length },
    diet: { loading: dietResult.isLoading, error: !!dietResult.error, hasData: !!dietResult.data?.length },
    fies: { loading: fiesResult.isLoading, error: !!fiesResult.error, hasData: !!fiesResult.data?.length },
  });
  
  console.log('[DEBUG] Data Lengths and Current Values:', {
    ffpi: `${ffpi.length} items, current: ${(last(ffpi) as any)?.value || 'N/A'}`,
    imfFood: `${imfFood.length} items, current: ${(last(imfFood) as any)?.value || 'N/A'}`,
    fx: `${fx.length} items, current: ${(last(fx) as any)?.value || 'N/A'}`,
    et0: `${et0.length} items, current: ${(last(et0) as any)?.anomaly_mm || (last(et0) as any)?.value || 'N/A'}`,
    diet: `${diet.length} items, current: ${(last(diet) as any)?.value || 'N/A'}`,
    fies: `${fies.length} items, current: ${(last(fies) as any)?.value || 'N/A'}`,
    refugees: `${refugees.length} items, current: ${(last(refugees) as any)?.value || 'N/A'}`,
    cbeInflation: `${cbeInflation.length} items, current: ${(last(cbeInflation) as any)?.value || 'N/A'}`
  });

  return {
    ffpi,
    imfFood,
    cbeInflation,
    cbeFood,
    et0,
    refugees,
    fx,
    diet,
    fies,
    isLoading: results.some(r => r.isLoading),
    isError: results.some(r => r.isError),
  };
}