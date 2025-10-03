import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, Shield, TriangleAlert as AlertTriangle, Activity, ChartPie as PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPercentage, formatCurrency } from '@/lib/formatters';

interface FinancialMetrics {
  revenue: number;
  expenses: number;
  reserves: number;
  cashPosition: number;
  programEfficiency: number;
}

interface FinancialHealthGridProps {
  metrics: FinancialMetrics;
}

export function FinancialHealthGrid({ metrics }: FinancialHealthGridProps) {
  // Calculate key ratios
  const operatingMargin = ((metrics.revenue - metrics.expenses) / metrics.revenue) * 100;
  const reserveMonths = (metrics.reserves / (metrics.expenses / 12));
  const cashRatio = (metrics.cashPosition / metrics.expenses) * 100;
  const sustainability = Math.min(100, (reserveMonths / 6) * 100); // Target: 6 months

  const getHealthStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return { status: 'excellent', color: 'success' };
    if (value >= thresholds.warning) return { status: 'good', color: 'warning' };
    return { status: 'attention', color: 'danger' };
  };

  const marginHealth = getHealthStatus(operatingMargin, { good: 5, warning: 0 });
  const reserveHealth = getHealthStatus(reserveMonths, { good: 6, warning: 3 });
  const sustainabilityHealth = getHealthStatus(sustainability, { good: 80, warning: 60 });

  return (
    <div className="space-y-6">
      <Card className="executive-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Activity className="w-6 h-6 text-primary" />
            Financial Health Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Financial Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="metric-label">Operating Margin</span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    marginHealth.color === 'success' && "text-success border-success",
                    marginHealth.color === 'warning' && "text-warning border-warning",
                    marginHealth.color === 'danger' && "text-danger border-danger"
                  )}
                >
                  {marginHealth.status}
                </Badge>
              </div>
              <div className="text-2xl font-bold">
                {formatPercentage(operatingMargin)}
              </div>
              <Progress 
                value={8} 
                className={cn(
                  "h-2",
                  "[&>div]:bg-red-500 [&>div]:animate-pulse"
                )}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="metric-label">Reserve Adequacy</span>
                <Badge 
                  variant="outline"
                  className={cn(
                    reserveHealth.color === 'success' && "text-success border-success",
                    reserveHealth.color === 'warning' && "text-warning border-warning",
                    reserveHealth.color === 'danger' && "text-danger border-danger"
                  )}
                >
                  {reserveHealth.status}
                </Badge>
              </div>
              <div className="text-2xl font-bold">
                {reserveMonths.toFixed(1)} months
              </div>
              <Progress 
                value={Math.min(100, (reserveMonths / 6) * 100)} 
                className={cn(
                  "h-2",
                  reserveHealth.color === 'success' && "[&>div]:bg-green-500",
                  reserveHealth.color === 'warning' && "[&>div]:bg-orange-500", 
                  reserveHealth.color === 'danger' && "[&>div]:bg-red-500"
                )}
              />
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  <span className="font-medium">Revenue</span>
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(metrics.revenue)}
                </div>
                <div className="text-sm text-success">+3.4% YoY</div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-warning" />
                  <span className="font-medium">Expenses</span>
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(metrics.expenses)}
                </div>
                <div className="text-sm text-warning">+18% YoY</div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-medium">Reserves</span>
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(metrics.reserves)}
                </div>
                <div className="text-sm text-muted-foreground">Liquid assets</div>
              </CardContent>
            </Card>
          </div>

          {/* Sustainability Score */}
          <Card className="bg-gradient-dark border border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Organizational Sustainability</span>
                </div>
                <Badge 
                  variant="outline"
                  className={cn(
                    sustainabilityHealth.color === 'success' && "text-success border-success",
                    sustainabilityHealth.color === 'warning' && "text-warning border-warning",
                    sustainabilityHealth.color === 'danger' && "text-danger border-danger"
                  )}
                >
                  {Math.round(sustainability)}%
                </Badge>
              </div>
              
              <div className="space-y-3">
                <Progress 
                  value={sustainability} 
                  className={cn(
                    "h-3",
                    sustainabilityHealth.color === 'success' && "[&>div]:bg-green-500",
                    sustainabilityHealth.color === 'warning' && "[&>div]:bg-orange-500",
                    sustainabilityHealth.color === 'danger' && "[&>div]:bg-red-500"
                  )}
                />
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Program Efficiency</div>
                    <div className="text-success">{metrics.programEfficiency}%</div>
                  </div>
                  <div>
                    <div className="font-medium">Cash Coverage</div>
                    <div className="text-warning">{formatPercentage(cashRatio)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Risk Level</div>
                    <div className={cn(
                      sustainability > 80 ? "text-success" : 
                      sustainability > 60 ? "text-warning" : "text-danger"
                    )}>
                      {sustainability > 80 ? "Low" : sustainability > 60 ? "Medium" : "High"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}