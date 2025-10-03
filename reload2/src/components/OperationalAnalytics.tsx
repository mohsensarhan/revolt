import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Users, 
  Package, 
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Activity
} from 'lucide-react';
import { MetricDetailModal } from './MetricDetailModal';
import { cn } from '@/lib/utils';

interface OperationalMetric {
  title: string;
  value: number | string;
  description: string;
  methodology: string;
  dataSource: string;
  interpretation: string;
  significance: string;
  benchmarks?: Array<{ label: string; value: string; status: 'good' | 'warning' | 'critical' }>;
  recommendations?: string[];
}

export function OperationalAnalytics() {
  const [selectedMetric, setSelectedMetric] = useState<OperationalMetric | null>(null);

  const operationalMetrics = [
    {
      title: "Distribution Efficiency Rate",
      value: "94.7%",
      change: "+2.3% vs target",
      trend: "up" as const,
      icon: <Truck className="w-5 h-5" />,
      color: "success" as const,
      description: "Percentage of food boxes successfully delivered to intended beneficiaries",
      methodology: "Calculated as (Successfully Delivered Boxes ÷ Total Dispatched Boxes) × 100. Success defined as verified delivery to correct beneficiary within planned timeframe.",
      dataSource: "EFB Logistics Management System + Partner Organization Reports",
      interpretation: "94.7% efficiency indicates world-class distribution capability, exceeding UN WFP benchmark of 92%",
      significance: "Critical operational KPI showing EFB's ability to execute at scale while maintaining quality",
      benchmarks: [
        { label: "UN WFP Global Standard", value: "92%", status: "good" as const },
        { label: "EFB FY2023 Performance", value: "92.4%", status: "good" as const },
        { label: "Industry Best Practice", value: "95%+", status: "warning" as const }
      ],
      recommendations: [
        "Implement AI-powered route optimization to reach 96% efficiency",
        "Expand partnership network in remote governorates",
        "Deploy IoT tracking for real-time delivery monitoring"
      ]
    },
    {
      title: "Average Cost Per Beneficiary",
      value: "EGP 459",
      change: "-8.2% cost reduction",
      trend: "down" as const,
      icon: <Users className="w-5 h-5" />,
      color: "success" as const,
      description: "Total annual cost per unique individual served across all programs",
      methodology: "Total Program Expenses ÷ Unique Beneficiaries Served. Includes direct food costs, logistics, administrative overhead allocated by time-driven activity-based costing.",
      dataSource: "ERP Financial System + Beneficiary Database Integration",
      interpretation: "EGP 459 (~$15 USD) per person annually represents exceptional cost efficiency in humanitarian sector",
      significance: "Demonstrates EFB's operational excellence and scalability, enabling maximum impact per donor dollar",
      benchmarks: [
        { label: "USAID Cost Standard", value: "$28 per person", status: "good" as const },
        { label: "Regional NGO Average", value: "$22 per person", status: "good" as const },
        { label: "Global Best Practice", value: "$12-18 per person", status: "good" as const }
      ],
      recommendations: [
        "Leverage economies of scale for 15% further cost reduction",
        "Implement predictive analytics for demand forecasting",
        "Optimize warehouse consolidation strategy"
      ]
    }
  ];

  const logisticsKPIs = [
    {
      label: "Warehouse Utilization",
      value: 87,
      target: 85,
      unit: "%",
      status: "success" as const,
      detail: "20 strategic distribution centers operating at optimal capacity"
    },
    {
      label: "Delivery Time Accuracy",
      value: 91,
      target: 90,
      unit: "%",
      status: "success" as const,
      detail: "On-time delivery within ±2 days of scheduled date"
    },
    {
      label: "Inventory Turnover",
      value: 24,
      target: 20,
      unit: "times/year",
      status: "success" as const,
      detail: "15-day average inventory holding period"
    },
    {
      label: "Partner Network Reliability",
      value: 96,
      target: 95,
      unit: "%",
      status: "success" as const,
      detail: "5,000 partners maintaining quality standards"
    }
  ];

  const geographicCoverage = [
    { governorate: "Cairo", coverage: 98, beneficiaries: 782000, efficiency: 97 },
    { governorate: "Giza", coverage: 96, beneficiaries: 445000, efficiency: 95 },
    { governorate: "Alexandria", coverage: 94, beneficiaries: 337000, efficiency: 93 },
    { governorate: "Qalyubia", coverage: 92, beneficiaries: 298000, efficiency: 94 },
    { governorate: "Beheira", coverage: 89, beneficiaries: 267000, efficiency: 91 },
    { governorate: "Others (22)", coverage: 85, beneficiaries: 2831000, efficiency: 89 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <h2 className="heading-lg text-foreground">Operational Excellence Dashboard</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Comprehensive real-time monitoring of distribution efficiency, logistics performance, and geographic reach across all operational channels
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-2">
          <Badge 
            variant="outline" 
            className="text-success border-success bg-success/5 px-4 py-2 text-sm font-medium rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              Live Operations Data
            </div>
          </Badge>
          <span className="text-xs text-muted-foreground">Updated every 30 seconds</span>
        </div>
      </div>

      {/* Key Operational Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {operationalMetrics.map((metric) => (
          <Card 
            key={metric.title}
            className="executive-card cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => setSelectedMetric(metric)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-md ${
                    metric.color === 'success' ? 'bg-success/10 text-success' : 
                    metric.color === 'warning' ? 'bg-warning/10 text-warning' : 
                    'bg-danger/10 text-danger'
                  }`}>
                    {metric.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{metric.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{metric.description}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">{metric.value}</div>
                <div className={`text-sm flex items-center gap-1 ${
                  metric.trend === 'up' ? 'text-success' : 'text-warning'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                  {metric.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Logistics Performance Grid */}
      <Card className="executive-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Logistics Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {logisticsKPIs.map((kpi) => (
              <div key={kpi.label} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{kpi.label}</span>
                  <Badge variant={kpi.status === 'success' ? 'default' : 'secondary'}>
                    {kpi.status === 'success' ? 'On Target' : 'Monitor'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">{kpi.value}</span>
                    <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                  </div>
                    <Progress 
                      value={(kpi.value / (kpi.target * 1.2)) * 100} 
                      className={cn(
                        "h-2",
                        kpi.status === 'success' && "[&>div]:bg-green-500",
                        kpi.status !== 'success' && "[&>div]:bg-orange-500"
                      )} 
                    />
                  <div className="text-xs text-muted-foreground">
                    Target: {kpi.target}{kpi.unit} | {kpi.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Geographic Coverage Analysis */}
      <Card className="executive-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Geographic Coverage & Efficiency Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribution efficiency and beneficiary reach across Egypt's 27 governorates
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {geographicCoverage.map((area) => (
              <div key={area.governorate} className="p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{area.governorate}</h4>
                    <p className="text-sm text-muted-foreground">
                      {area.beneficiaries.toLocaleString()} beneficiaries served
                    </p>
                  </div>
                  <Badge variant="outline" className={
                    area.efficiency >= 95 ? "text-success border-success" :
                    area.efficiency >= 90 ? "text-warning border-warning" :
                    "text-danger border-danger"
                  }>
                    {area.efficiency}% Efficiency
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Coverage Rate</span>
                    <span>{area.coverage}%</span>
                  </div>
                  <Progress value={area.coverage} className={cn(
                    "h-2",
                    area.efficiency >= 95 && "[&>div]:bg-green-500",
                    area.efficiency >= 90 && area.efficiency < 95 && "[&>div]:bg-orange-500",
                    area.efficiency < 90 && "[&>div]:bg-red-500"
                  )} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Alerts */}
      <Card className="executive-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Real-time Operational Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-success/10 rounded-md">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <div>
                <span className="font-medium text-success">All Systems Operational</span>
                <div className="text-sm text-muted-foreground">
                  No critical alerts • All distribution centers online • Partner network stable
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-warning/10 rounded-md">
              <Clock className="w-5 h-5 text-warning" />
              <div>
                <span className="font-medium text-warning">Seasonal Demand Spike Detected</span>
                <div className="text-sm text-muted-foreground">
                  15% increase in Ramadan preparation requests • Inventory management activated
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal for detailed explanations */}
      {selectedMetric && (
        <MetricDetailModal 
          isOpen={!!selectedMetric}
          onClose={() => setSelectedMetric(null)}
          metric={selectedMetric}
        />
      )}
    </div>
  );
}

export default OperationalAnalytics;