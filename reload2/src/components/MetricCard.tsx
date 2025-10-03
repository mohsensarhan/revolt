import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatMetricValue } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  format: 'number' | 'currency' | 'percentage' | 'simple';
  prefix?: string;
  suffix?: string;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
  color?: 'success' | 'warning' | 'danger' | 'neutral' | 'primary';
  description?: string;
  interactive?: boolean;
  onClick?: () => void;
}

const MetricCard = memo(({
  title,
  value,
  format,
  prefix,
  suffix,
  change,
  trend,
  icon,
  color = 'primary',
  description,
  interactive = true,
  onClick,
}: MetricCardProps) => {

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      case 'stable':
        return <Minus className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getColorClasses = () => {
    const baseClasses = "metric-card group";
    switch (color) {
      case 'success':
        return cn(baseClasses, "border-l-4 border-l-success hover:shadow-glow hover:border-success/50");
      case 'warning':
        return cn(baseClasses, "border-l-4 border-l-warning hover:shadow-[0_0_30px_hsl(var(--warning)/0.3)]");
      case 'danger':
        return cn(baseClasses, "border-l-4 border-l-danger hover:shadow-[0_0_30px_hsl(var(--danger)/0.3)]");
      case 'neutral':
        return cn(baseClasses, "border-l-4 border-l-neutral hover:shadow-[0_0_30px_hsl(0_0%_100%/0.1)]");
      default:
        return cn(baseClasses, "border-l-4 border-l-primary hover:shadow-glow");
    }
  };

  return (
    <Card 
      className={cn(
        getColorClasses(),
        interactive && "cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      )}
      onClick={interactive ? onClick : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `View details for ${title}` : undefined}
      onKeyDown={interactive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "p-2 rounded-lg",
            color === 'success' && "bg-success/10 text-success",
            color === 'warning' && "bg-warning/10 text-warning", 
            color === 'danger' && "bg-danger/10 text-danger",
            color === 'neutral' && "bg-neutral/10 text-neutral",
            color === 'primary' && "bg-primary/10 text-primary"
          )} aria-hidden="true">
            {icon}
          </div>
          {change && (
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-medium",
                trend === 'up' && "text-success border-success",
                trend === 'down' && "text-danger border-danger",
                trend === 'stable' && "text-muted-foreground border-muted-foreground"
              )}
              aria-label={`Trend: ${trend}, Change: ${change}`}
            >
              <span aria-hidden="true">{getTrendIcon()}</span>
              <span className="ml-1">{change}</span>
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <p className="metric-label text-sm sm:text-base">{title}</p>
          <div className="flex items-baseline gap-1">
            {prefix && <span className="text-base sm:text-lg font-semibold text-muted-foreground">{prefix}</span>}
            <span className="metric-value text-xl sm:text-2xl">{formatMetricValue(value, format)}</span>
            {suffix && <span className="text-base sm:text-lg font-semibold text-muted-foreground">{suffix}</span>}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = 'MetricCard';

export { MetricCard };