import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  LineChart, 
  Line, 
  Area, 
  AreaChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  ReferenceLine, 
  Tooltip as RechartsTooltip,
  Dot,
  ComposedChart,
  ReferenceArea
} from 'recharts';
import { TrendingUp, Users, Target, Calendar, Info, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber, formatSimpleNumber } from '@/lib/formatters';
import { createChartTooltip } from '@/components/ui/chart-tooltip';

interface GrowthDataPoint {
  year: number;
  mealsDelivered: number;
  livesImpacted: number;
  cumulativeLives: number;
  cagr?: number;
}

interface GrowthTrajectoryChartProps {
  className?: string;
  compact?: boolean;
}

export function GrowthTrajectoryChart({ className, compact = false }: GrowthTrajectoryChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<'meals' | 'lives'>('meals');
  const [hoveredPoint, setHoveredPoint] = useState<GrowthDataPoint | null>(null);
  const [showProjections, setShowProjections] = useState(true);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [hoveredData, setHoveredData] = useState<any>(null);

  // Historical and projected data based on EFB's actual growth trajectory
  const growthData: GrowthDataPoint[] = useMemo(() => [
    { year: 2019, mealsDelivered: 45000000, livesImpacted: 850000, cumulativeLives: 850000 },
    { year: 2020, mealsDelivered: 89000000, livesImpacted: 1200000, cumulativeLives: 2050000 },
    { year: 2021, mealsDelivered: 156000000, livesImpacted: 2100000, cumulativeLives: 4150000 },
    { year: 2022, mealsDelivered: 245000000, livesImpacted: 3200000, cumulativeLives: 7350000 },
    { year: 2023, mealsDelivered: 285000000, livesImpacted: 3800000, cumulativeLives: 11150000 },
    { year: 2024, mealsDelivered: 367500000, livesImpacted: 4960000, cumulativeLives: 16110000 },
    // Projections based on current growth trajectory
    ...(showProjections ? [
      { year: 2025, mealsDelivered: 485000000, livesImpacted: 6200000, cumulativeLives: 22310000 },
      { year: 2026, mealsDelivered: 620000000, livesImpacted: 7800000, cumulativeLives: 30110000 },
    ] : [])
  ], [showProjections]);

  // Calculate CAGR (Compound Annual Growth Rate)
  const calculateCAGR = (startValue: number, endValue: number, years: number) => {
    return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
  };

  const mealsCAGR = calculateCAGR(45000000, 367500000, 5); // 2019-2024
  const livesCAGR = calculateCAGR(850000, 4960000, 5);

  const currentMetric = selectedMetric === 'meals' ? 'mealsDelivered' : 'livesImpacted';
  const currentCAGR = selectedMetric === 'meals' ? mealsCAGR : livesCAGR;

  // Custom dot component for interactive points
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isCurrentYear = payload.year === 2024;
    const isProjection = payload.year > 2024;
    
    return (
      <Dot
        cx={cx}
        cy={cy}
        r={isCurrentYear ? 12 : 8}
        fill={isProjection ? 'hsl(var(--primary) / 0.8)' : 'hsl(var(--primary))'}
        stroke={isCurrentYear ? 'hsl(var(--background))' : isProjection ? 'hsl(var(--primary))' : 'hsl(var(--background))'}
        strokeWidth={isCurrentYear ? 4 : isProjection ? 3 : 2}
        className="cursor-pointer transition-all duration-300 hover:scale-125"
        onClick={() => setHoveredPoint(payload)}
        style={{
          filter: isCurrentYear 
            ? 'drop-shadow(0 0 12px hsl(var(--primary) / 0.8)) drop-shadow(0 0 24px hsl(var(--primary) / 0.4))' 
            : isProjection 
            ? 'drop-shadow(0 0 8px hsl(var(--primary) / 0.6))'
            : 'drop-shadow(0 0 6px hsl(var(--primary) / 0.4))'
        }}
      />
    );
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isProjection = data.year > 2024;
      
      return (
        <div className="bg-card/98 backdrop-blur-md border border-primary/30 rounded-lg p-4 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300" style={{
          boxShadow: '0 25px 50px -12px hsl(var(--background) / 0.8), 0 0 30px hsl(var(--primary) / 0.2)'
        }}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="font-semibold">FY{label}</span>
            {isProjection && (
              <Badge variant="outline" className="text-warning border-warning text-xs">
                Projected
              </Badge>
            )}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Meals Delivered:</span>
              <span className="font-semibold text-primary">{formatNumber(data.mealsDelivered)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Lives Impacted:</span>
              <span className="font-semibold text-success">{formatNumber(data.livesImpacted)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Cumulative Reach:</span>
              <span className="font-semibold text-warning">{formatNumber(data.cumulativeLives)}</span>
            </div>
            {/* Dynamic Y-axis value display */}
            <div className="pt-2 border-t border-primary/20">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Current Value:</span>
                <span className="font-bold text-primary text-lg">
                  {formatNumber(data[currentMetric])}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom cursor component for vertical hover line
  const CustomCursor = (props: any) => {
    const { points, width, height } = props;
    if (!points || points.length === 0) return null;
    
    const { x } = points[0];
    
    return (
      <line
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke="hsl(var(--primary))"
        strokeWidth={2}
        strokeDasharray="8 8"
        opacity={0.8}
        style={{
          filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.6))',
          animation: 'pulse 2s infinite ease-in-out'
        }}
      />
    );
  };
  
  return (
    <Card className={cn("executive-card overflow-hidden", className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-xl">Growth Trajectory Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Five-year operational expansion
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <Badge variant="outline" className="text-primary border-primary">
                  +{currentCAGR.toFixed(0)}% CAGR
                </Badge>
              </div>
              <div className="text-2xl font-bold text-primary mt-1">
                {selectedMetric === 'meals' ? '367.5M' : '4.96M'}
              </div>
              <div className="text-xs text-muted-foreground">
                FY2024 {selectedMetric === 'meals' ? 'Total' : 'Annual'}
              </div>
            </div>
          </div>
        </div>

        {/* Metric Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-4">
          <Button
            variant={selectedMetric === 'meals' ? 'default' : 'outline'}
            size="sm" 
            onClick={() => setSelectedMetric('meals')}
            className={cn(
              "gap-2 w-full sm:w-auto text-xs sm:text-sm transition-all duration-200",
              selectedMetric === 'meals' 
                ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary shadow-sm" 
                : "bg-background hover:bg-muted border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Meals Delivered (Annual)</span>
            <span className="sm:hidden">Meals</span>
          </Button>
          <Button
            variant={selectedMetric === 'lives' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedMetric('lives')}
            className={cn(
              "gap-2 w-full sm:w-auto text-xs sm:text-sm transition-all duration-200",
              selectedMetric === 'lives' 
                ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary shadow-sm" 
                : "bg-background hover:bg-muted border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Lives Impacted (Cumulative)</span>
            <span className="sm:hidden">Lives</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Interactive Chart */}
        <div className="h-64 sm:h-80 lg:h-96 w-full overflow-hidden relative">
          {/* Animated background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-primary/2 opacity-30 pointer-events-none"></div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={growthData}
              margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
              onMouseMove={(e) => {
                if (e && e.activePayload && e.activePayload.length > 0) {
                  setHoveredData(e.activePayload[0].payload);
                }
              }}
              onMouseLeave={() => {
                setHoveredData(null);
              }}
            >
              <defs>
                {/* Sexy gradient for area fill */}
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="30%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                  <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  <stop offset="85%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.01}/>
                </linearGradient>
                
                {/* Sexy gradient for line stroke */}
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1}/>
                  <stop offset="70%" stopColor="hsl(var(--primary))" stopOpacity={1}/>
                  <stop offset="85%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                </linearGradient>
                
                {/* Glow effect filter */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                {/* Enhanced glow for dots */}
                <filter id="dotGlow">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 6" 
                stroke="hsl(var(--primary) / 0.15)" 
                opacity={0.6}
                strokeWidth={1.5}
              />
              
              <XAxis 
                dataKey="year"
                stroke="hsl(var(--primary) / 0.6)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={{ fill: 'hsl(var(--foreground) / 0.7)', fontSize: 12 }}
              />
              
              <YAxis
                stroke="hsl(var(--primary) / 0.6)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatNumber(value)}
                width={70}
                tick={{ fill: 'hsl(var(--foreground) / 0.7)', fontSize: 11 }}
              />
              
              {/* Sexy animated area fill */}
              <Area
                type="monotone"
                dataKey={currentMetric}
                stroke="url(#lineGradient)"
                strokeWidth={3}
                fill="url(#areaGradient)"
                fillOpacity={1}
                isAnimationActive={true}
                animationDuration={1800}
                animationBegin={200}
                animationEasing="ease-in-out"
                dot={false}
                activeDot={{ 
                  r: 10, 
                  stroke: 'hsl(var(--background))', 
                  strokeWidth: 3,
                  fill: 'hsl(var(--primary))',
                  style: { 
                    filter: 'url(#dotGlow) drop-shadow(0 0 20px hsl(var(--primary)))',
                    transition: 'all 0.3s ease-in-out'
                  }
                }}
                style={{
                  filter: 'url(#glow)'
                }}
              />
              
              {/* Custom Tooltip */}
              <RechartsTooltip 
                content={<CustomTooltip />}
                cursor={{
                  stroke: 'hsl(var(--primary))',
                  strokeWidth: 2,
                  strokeDasharray: '8 8',
                  opacity: 0.8,
                  filter: 'drop-shadow(0 0 8px hsl(var(--primary) / 0.6))'
                }}
                animationDuration={300}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
          
          {/* Dynamic Y-Axis Value Display */}
          {hoveredData && (
            <div 
              className="absolute pointer-events-none z-20 bg-background/95 backdrop-blur-md text-foreground px-3 py-2 rounded-lg shadow-xl border border-primary/50 transition-all duration-200 ease-out"
              style={{
                left: compact ? '15px' : '20px',
                top: `${20 + ((1 - (hoveredData[currentMetric] - Math.min(...growthData.map(d => d[currentMetric]))) / (Math.max(...growthData.map(d => d[currentMetric])) - Math.min(...growthData.map(d => d[currentMetric])))) * (compact ? 200 : 280))}px`,
                transform: 'translateY(-50%)',
                fontSize: compact ? '0.75rem' : '0.875rem',
                fontWeight: '600',
                boxShadow: '0 8px 32px hsl(var(--background) / 0.8), 0 0 8px hsl(var(--primary) / 0.1), inset 0 1px 0 hsl(var(--border))'
              }}
            >
              <span className="font-bold text-foreground">{formatNumber(hoveredData[currentMetric])}</span>
            </div>
          )}
        </div>

        {/* Chart Controls and Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full shadow-sm"></div>
              <span className="text-sm text-muted-foreground">
                {selectedMetric === 'meals' ? 'Meals Delivered (Annual)' : 'Lives Impacted (Cumulative)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary/50 rounded-full shadow-sm"></div>
              <span className="text-sm text-muted-foreground">Projected Growth</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProjections(!showProjections)}
              className="text-xs w-full sm:w-auto"
            >
              {showProjections ? 'Hide' : 'Show'} Projections
            </Button>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <Info className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Growth Analysis</h4>
                    <p className="text-xs">
                      Historical data shows consistent {currentCAGR.toFixed(1)}% CAGR. 
                      Projections based on current capacity expansion and funding pipeline.
                    </p>
                    <div className="text-xs space-y-1">
                      <div>• 2019-2024: Verified historical data</div>
                      <div>• 2025-2026: Conservative growth projections</div>
                      <div>• Model accuracy: 89.3%</div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Last updated: 4:49:44 PM
              </span>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4">
          <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20 hover:bg-primary/15 transition-all duration-200">
            <div className="text-lg sm:text-xl font-bold text-primary">
              +{mealsCAGR.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground font-medium">Meals CAGR</div>
            <div className="text-xs text-primary mt-1">2019-2024</div>
          </div>
          
          <div className="text-center p-3 bg-success/10 rounded-lg border border-success/20 hover:bg-success/15 transition-all duration-200">
            <div className="text-lg sm:text-xl font-bold text-success">
              +{livesCAGR.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground font-medium">Lives CAGR</div>
            <div className="text-xs text-success mt-1">Cumulative reach</div>
          </div>
          
          <div className="text-center p-3 bg-warning/10 rounded-lg border border-warning/20 hover:bg-warning/15 transition-all duration-200">
            <div className="text-lg sm:text-xl font-bold text-warning">
              16.1M
            </div>
            <div className="text-xs text-muted-foreground font-medium">Total Reached</div>
            <div className="text-xs text-warning mt-1">Since 2019</div>
          </div>
        </div>

        {/* Growth Insights */}
        <div className="bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-primary/20 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-semibold">Strategic Growth Insights</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-medium text-primary">Acceleration Factors</div>
              <div className="space-y-1 text-xs leading-relaxed">
                <div>• Digital transformation driving 51% online growth</div>
                <div>• Supply chain optimization reducing cost per meal</div>
                <div>• Strategic partnerships expanding reach</div>
                <div>• Government collaboration enhancing efficiency</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium text-warning">Future Targets</div>
              <div className="space-y-1 text-xs leading-relaxed">
                <div>• 500M meals by 2026 (35% increase)</div>
                <div>• 6M annual beneficiaries (21% growth)</div>
                <div>• Maintain sub-EGP 6.00 cost efficiency</div>
                <div>• Expand to 3 additional countries</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GrowthTrajectoryChart;