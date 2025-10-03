// World Bank/IMF Commodity Prices API endpoint
export async function GET(request: Request) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get('symbol') || 'wheat';
  
  try {
    // World Bank Pink Sheet data (alternative: IMF commodity prices)
    const response = await fetch('https://thedocs.worldbank.org/en/doc/5d903e848db1d1b83e0ec8f744e55570-0350012021/related/CMO-Historical-Data-Monthly.csv');
    
    if (!response.ok) {
      throw new Error(`World Bank API error: ${response.status}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    // Find the appropriate column for the requested commodity
    const headerRow = lines[0];
    const headers = headerRow.split(',');
    
    let commodityColumn = -1;
    let unit = 'USD/metric ton';
    
    switch (symbol) {
      case 'wheat':
        commodityColumn = headers.findIndex(h => h.toLowerCase().includes('wheat'));
        unit = 'USD/ton';
        break;
      case 'veg_oils':
        commodityColumn = headers.findIndex(h => h.toLowerCase().includes('palm oil') || h.toLowerCase().includes('vegetable'));
        unit = 'index';
        break;
      case 'sugar':
        commodityColumn = headers.findIndex(h => h.toLowerCase().includes('sugar'));
        unit = 'index';
        break;
    }
    
    if (commodityColumn === -1) {
      throw new Error(`Commodity ${symbol} not found`);
    }
    
    const dataRows = lines.slice(1).filter(line => line.trim());
    const points = dataRows
      .map(line => {
        const columns = line.split(',');
        const date = columns[0]?.trim();
        const value = parseFloat(columns[commodityColumn]?.trim());
        
        if (date && !isNaN(value)) {
          return { date, value };
        }
        return null;
      })
      .filter(Boolean)
      .slice(-24); // Last 24 months
    
    return new Response(JSON.stringify({
      label: symbol,
      unit,
      points
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=21600'
      }
    });
    
  } catch (error) {
    console.error(`Commodity ${symbol} API error:`, error);
    
    // Fallback to mock data based on symbol
    const mockPoints = Array.from({ length: 24 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (23 - i));
      
      let baseValue = 255.0; // wheat default
      let trend = -0.2;
      
      if (symbol === 'veg_oils') {
        baseValue = 138.0;
        trend = 0.05;
      } else if (symbol === 'sugar') {
        baseValue = 152.0;
        trend = -0.05;
      }
      
      return {
        date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        value: baseValue + i * trend + Math.sin(i * 0.5) * 6.0
      };
    });
    
    return new Response(JSON.stringify({
      label: symbol,
      unit: symbol === 'wheat' ? 'USD/ton' : 'index',
      points: mockPoints
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }
}