import React from 'react';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: any;
  title?: string;
  unit?: string;
  formatValue?: (value: number) => string;
  showTitle?: boolean;
}

/**
 * Universal chart tooltip component that handles date/label formatting correctly
 * Fixes the common issue where array indices are shown instead of actual dates
 */
export function ChartTooltip({ 
  active, 
  payload, 
  label, 
  title, 
  unit, 
  formatValue,
  showTitle = true 
}: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  // Get the real date/key from payload data, not the label (which might be array index)
  const payloadData = payload[0]?.payload;
  const realDate = payloadData?.date || payloadData?.year || label;
  const tooltipValue = payload[0].value;

  const formatDate = (dateValue: any): string => {
    try {
      // Convert to string for processing
      const dateString = String(dateValue);
      
      // Handle YYYY format (years) - for annual data
      if (dateString && dateString.match(/^\d{4}$/)) {
        return dateString;
      }
      
      // Handle YYYY-MM format (months) - for monthly data
      if (dateString && dateString.match(/^\d{4}-\d{2}$/)) {
        const [year, month] = dateString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      
      // Handle YYYY-MM-DD format (days) - for daily data
      if (dateString && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(dateString).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric' 
        });
      }
      
      // Handle numeric years (convert to string)
      if (typeof dateValue === 'number' && dateValue > 1900 && dateValue < 2100) {
        return String(dateValue);
      }
      
      // Fallback - return as string
      return dateString;
    } catch (error) {
      console.warn('[ChartTooltip] Date formatting error:', error, 'for input:', dateValue);
      return String(dateValue);
    }
  };

  const defaultFormatValue = (val: number): string => {
    // Format large numbers with K, M suffixes
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toLocaleString();
  };

  const formattedValue = formatValue ? formatValue(tooltipValue) : defaultFormatValue(tooltipValue);
  const formattedDate = formatDate(realDate);

  return (
    <div className="bg-popover border border-border rounded-md shadow-lg p-3 text-sm font-medium min-w-[120px]">
      <div className="text-muted-foreground text-xs mb-1">{formattedDate}</div>
      <div className="text-foreground flex items-center justify-between">
        <span className="font-semibold">{formattedValue}</span>
        {unit && <span className="text-muted-foreground text-xs ml-2">{unit}</span>}
      </div>
      {showTitle && title && (
        <div className="text-muted-foreground text-xs mt-1">{title}</div>
      )}
    </div>
  );
}

/**
 * Factory function to create a customized tooltip component
 */
export function createChartTooltip(options: Omit<ChartTooltipProps, 'active' | 'payload' | 'label'>) {
  return function CustomTooltip({ active, payload, label }: any) {
    return (
      <ChartTooltip
        active={active}
        payload={payload}
        label={label}
        {...options}
      />
    );
  };
}