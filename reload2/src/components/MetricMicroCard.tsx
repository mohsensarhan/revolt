import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Line, LineChart, Tooltip as RechartsTooltip, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { createChartTooltip } from '@/components/ui/chart-tooltip';
interface MetricMicroCardProps {
  title: string;
  value: number;
  format?: 'number' | 'percentage' | 'currency';
  delta?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'flat';
  };
  yoyChange?: number; // Year-over-year change percentage
  spark?: Array<{
    t: string;
    v: number;
  }>;
  chart?: 'area' | 'line';
  footnote?: string;
  description?: string; // What this metric means
  unit?: string; // Display unit (e.g., "USD/ton", "index", "%")
  dataStatus?: 'live' | 'mock' | 'disconnected'; // Data connection status
  dataSource?: string; // Source of the data (e.g., "FAO", "IMF", "OWID")
}
export function MetricMicroCard({
  title,
  value,
  format = 'number',
  delta,
  yoyChange,
  spark = [],
  chart = 'area',
  footnote,
  description,
  unit,
  dataStatus = 'disconnected',
  dataSource
}: MetricMicroCardProps) {
  const [animationKey, setAnimationKey] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  console.log('[DEBUG] MetricMicroCard props:', {
    title,
    value,
    delta,
    description: !!description,
    // Log if description exists
    sparkLen: spark?.length ?? 0,
    sparkData: spark?.slice(0, 3) // First 3 points for debugging
  });

  // Convert spark data to chart format
  const chartData = spark.map(point => ({
    date: point.t,
    value: point.v
  }));

  const handleMouseEnter = () => {
    if (!isHovering) {
      setIsHovering(true);
      setAnimationKey(prev => prev + 1);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };
  const getTrendIcon = () => {
    if (!delta) return <Minus className="w-3 h-3" />;
    switch (delta.direction) {
      case 'up':
        return <TrendingUp className="w-3 h-3" />;
      case 'down':
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };
  const getTrendColor = () => {
    if (!delta || delta.direction === 'flat') return 'text-muted-foreground';
    return delta.direction === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  };
  const formatValue = (val: number) => {
    if (format === 'percentage') return `${val.toFixed(1)}%`;
    if (format === 'currency') return `$${val.toLocaleString()}`;

    // Format large numbers with K, M suffixes
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toLocaleString();
  };
  const getStatusColor = () => {
    switch (dataStatus) {
      case 'live':
        return 'bg-emerald-500';
      case 'mock':
        return 'bg-blue-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };
  const getStatusTooltip = () => {
    switch (dataStatus) {
      case 'live':
        return 'Live data connection';
      case 'mock':
        return 'Using mock data';
      case 'disconnected':
        return 'Data connection failed';
      default:
        return 'Unknown status';
    }
  };
  const getYoyColor = () => {
    if (!yoyChange) return 'text-muted-foreground';
    return yoyChange > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  };

  // Create a customized tooltip for this metric card
  const CustomTooltip = createChartTooltip({
    title,
    unit,
    formatValue: (val: number) => {
      if (format === 'percentage') return `${val.toFixed(1)}%`;
      if (format === 'currency') return `$${val.toLocaleString()}`;

      // Format large numbers with K, M suffixes
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
      return val.toLocaleString();
    }
  });
  return <TooltipProvider>
      <Card
        className="executive-card h-[280px] transition-all duration-300 hover:shadow-lg group cursor-pointer bg-gradient-to-br from-card to-card/95 border border-border/50 hover:border-primary/30 relative z-10 hover:z-20 overflow-visible"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <CardContent className="p-0 h-full flex flex-col">
          {/* Header with Info Icon */}
          <div className="mb-3 px-4 pt-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground leading-tight">
                {title}
              </h3>
              <div className="flex items-center gap-2">
                {/* Info Icon - next to title */}
                {description && <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-emerald-600 hover:text-emerald-500 transition-colors cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      align="center" 
                      sideOffset={8} 
                      className="max-w-[280px] z-[99999] bg-black border border-gray-700 shadow-xl text-white" 
                      style={{ zIndex: 99999 }}
                      avoidCollisions={true}
                      collisionPadding={20}
                    >
                      <p className="text-sm leading-relaxed">{description}</p>
                    </TooltipContent>
                  </Tooltip>}
                
                {/* Data Status Indicator - pushed further right */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn('w-2 h-2 rounded-full cursor-help transition-all duration-200 hover:scale-125 ml-1', getStatusColor())} />
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center" className="text-xs px-2 py-1">
                    {getStatusTooltip()}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Main Value with Unit */}
          <div className="mb-3 px-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground leading-none">
                {formatValue(value)}
              </span>
              {unit && <span className="text-xs text-muted-foreground font-medium">
                  {unit}
                </span>}
            </div>
          </div>

          {/* Changes Row - MoM and YoY */}
          <div className="flex items-center gap-4 mb-4 px-4">
            {/* Month-over-Month */}
            {delta && <div className={cn('flex items-center gap-1 text-xs font-medium', getTrendColor())}>
                {getTrendIcon()}
                <span>
                  {delta.value > 0 ? '+' : ''}{delta.value.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">{delta.label}</span>
              </div>}
            
            {/* Year-over-Year */}
            {yoyChange !== undefined && <div className={cn('flex items-center gap-1 text-xs font-medium', getYoyColor())}>
                {yoyChange > 0 ? <TrendingUp className="w-3 h-3" /> : yoyChange < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                <span>
                  {yoyChange > 0 ? '+' : ''}{yoyChange.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">y/y</span>
              </div>}
          </div>
          
          {/* Mini Chart - Full width, no padding */}
          <div className="flex-1 min-h-0 mb-0">
            {chartData.length > 0 ? <ResponsiveContainer width="100%" height="100%">
                {chart === 'area' ? <AreaChart data={chartData} key={animationKey} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
                    <defs>
                      <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0\" y1="0\" x2="0\" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      ticks={chartData.length > 0 ? [chartData[0].date, chartData[Math.floor(chartData.length / 2)].date, chartData[chartData.length - 1].date] : []}
                      tickFormatter={(value) => {
                        const year = value.toString();
                        return `'${year.slice(-2)}`;
                      }}
                    />
                    <YAxis hide />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2} 
                      fill={`url(#gradient-${title.replace(/\s+/g, '')})`} 
                      dot={false} 
                      activeDot={{
                        r: 3,
                        fill: 'hsl(var(--primary))',
                        stroke: 'hsl(var(--background))',
                        strokeWidth: 2
                      }}
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-in-out"
                    />
                  </AreaChart> : <LineChart data={chartData} key={animationKey} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      ticks={chartData.length > 0 ? [chartData[0].date, chartData[Math.floor(chartData.length / 2)].date, chartData[chartData.length - 1].date] : []}
                      tickFormatter={(value) => {
                        const year = value.toString();
                        return `'${year.slice(-2)}`;
                      }}
                    />
                    <YAxis hide />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2} 
                      dot={false} 
                      activeDot={{
                        r: 3,
                        fill: 'hsl(var(--primary))',
                        stroke: 'hsl(var(--background))',
                        strokeWidth: 2
                      }}
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-in-out"
                    />
                  </LineChart>}
              </ResponsiveContainer> : <div className="w-full h-full flex items-center justify-center">
                <div className="w-full h-8 bg-muted/20 rounded animate-pulse" />
              </div>}
          </div>

          {/* Data Source */}
          {dataSource && <div className="mb-2 text-center px-4">
              <span className="text-xs text-muted-foreground/70 font-medium bg-muted/30 px-2 py-1 rounded-md">
                Source: {dataSource}
              </span>
            </div>}

          {/* Footnote */}
          {footnote && <div className="text-xs text-muted-foreground leading-tight px-4 pb-4">
              {footnote}
            </div>}
        </CardContent>
      </Card>
    </TooltipProvider>;
}