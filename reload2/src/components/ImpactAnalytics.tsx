import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MetricDetailModal } from './MetricDetailModal';
import { 
  BarChart, 
  Map, 
  Users, 
  Target,
  Clock,
  Award,
  MapPin,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Metric } from './ExecutiveDashboard';

interface ImpactMetrics {
  mealsDelivered: number;
  peopleServed: number;
  costPerMeal: number;
  programEfficiency: number;
}

interface ImpactAnalyticsProps {
  metrics: ImpactMetrics;
}

export function ImpactAnalytics({ metrics }: ImpactAnalyticsProps) {
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  // Calculate derived metrics
  const dailyReach = Math.round(metrics.peopleServed / 365);
  const mealsPerPerson = Math.round(metrics.mealsDelivered / metrics.peopleServed);
  const globalRanking = 3; // Based on data from blueprint
  
  const governorateData = [
    { name: 'Cairo', coverage: 95, population: 2.2, meals: 45.2 },
    { name: 'Giza', coverage: 92, population: 1.8, meals: 38.7 },
    { name: 'Alexandria', coverage: 88, population: 1.5, meals: 32.1 },
    { name: 'Upper Egypt', coverage: 85, population: 8.2, meals: 89.3 },
    { name: 'Delta', coverage: 90, population: 12.1, meals: 112.8 },
    { name: 'Sinai & Red Sea', coverage: 78, population: 0.8, meals: 12.4 },
  ];

  const programBreakdown = [
    { name: 'Regular Food Boxes', percentage: 45, meals: 165.4, color: 'primary' },
    { name: 'School Feeding', percentage: 22, meals: 80.8, color: 'success' },
    { name: 'Emergency Relief', percentage: 18, meals: 66.1, color: 'warning' },
    { name: 'Nutrition Programs', percentage: 10, meals: 36.7, color: 'danger' },
    { name: 'Other Programs', percentage: 5, meals: 18.4, color: 'neutral' },
  ];

  const impactMetrics = [
    { label: 'Dietary Diversity Improvement', value: 25, unit: '%', color: 'success' },
    { label: 'Food Insecurity Reduction', value: 7, unit: '%', color: 'success' },
    { label: 'QALYs Gained', value: 10000, unit: 'lives', color: 'primary' },
    { label: 'DALYs Averted', value: 15000, unit: 'years', color: 'primary' },
  ];

  // Impact metrics for detailed modals
  const detailedMetrics = {
    geographicCoverage: {
      title: "Geographic Coverage Analysis",
      value: "27/27 Governorates",
      description: "Complete national coverage across Egypt with 5,000+ partner network",
      methodology: "Geographic Information System (GIS) mapping combined with partner network coverage analysis and beneficiary address verification.",
      dataSource: "Ministry of Social Solidarity Partnership + GPS Tracking + Partner Reports",
      interpretation: "100% governorate coverage with 87% average effectiveness demonstrates unparalleled national reach in humanitarian sector",
      significance: "Universal coverage ensures no Egyptian governorate lacks access to food security programs, critical during economic crisis",
      benchmarks: [
        { label: "UN WFP Egypt Operations", value: "23/27 governorates", status: "good" as const },
        { label: "Other Major NGOs", value: "15 governorates avg", status: "good" as const },
        { label: "EFB Achievement", value: "27/27 governorates", status: "good" as const }
      ],
      recommendations: [
        "Focus on improving efficiency in remote Sinai and Red Sea regions",
        "Establish permanent distribution centers in underserved areas",
        "Leverage technology for last-mile delivery optimization"
      ]
    },
    programDistribution: {
      title: "Program Distribution Effectiveness",
      value: "367.5M Meals Distributed",
      description: "Multi-program approach maximizing impact across emergency, prevention, and empowerment interventions",
      methodology: "Activity-based distribution tracking with biometric verification and beneficiary feedback systems across all program categories.",
      dataSource: "Integrated Program Management System + Beneficiary Database + Field Monitoring",
      interpretation: "Balanced portfolio with 45% regular assistance, 22% emergency response demonstrates adaptive programming excellence",
      significance: "Diversified approach ensures resilience against changing needs while maintaining consistent service delivery",
      benchmarks: [
        { label: "Global Food Banks", value: "Single program focus", status: "warning" as const },
        { label: "Integrated Approach Best Practice", value: "3-4 programs", status: "good" as const },
        { label: "EFB Multi-Program Model", value: "5+ integrated programs", status: "good" as const }
      ],
      recommendations: [
        "Expand nutrition education component to 40% of beneficiaries",
        "Integrate digital literacy training with empowerment programs",
        "Develop climate-resilient programming for vulnerable regions"
      ]
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Geographic Coverage */}
      <Card 
        className="executive-card cursor-pointer hover:shadow-lg transition-all duration-200"
        onClick={() => setSelectedMetric(detailedMetrics.geographicCoverage)}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            Geographic Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-danger">27/27</div>
              <div className="text-sm text-muted-foreground">Governorates</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">5,000+</div>
              <div className="text-sm text-muted-foreground">Partners</div>
            </div>
          </div>
          
          <div className="space-y-3">
            {governorateData.map((gov, index) => (
              <div key={gov.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{gov.name}</span>
                  <span className="text-muted-foreground">{gov.meals}M meals</span>
                </div>
                <Progress value={gov.coverage} className={cn(
                  "h-2",
                  gov.coverage >= 90 && "[&>div]:bg-green-500",
                  gov.coverage >= 80 && gov.coverage < 90 && "[&>div]:bg-orange-500",
                  gov.coverage < 80 && "[&>div]:bg-red-500"
                )} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{gov.coverage}% coverage</span>
                  <span>{gov.population}M people</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Program Distribution */}
      <Card 
        className="executive-card cursor-pointer hover:shadow-lg transition-all duration-200"
        onClick={() => setSelectedMetric(detailedMetrics.programDistribution)}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5 text-primary" />
            Program Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {programBreakdown.map((program, index) => (
              <div key={program.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      program.color === 'primary' && "bg-primary",
                      program.color === 'success' && "bg-success",
                      program.color === 'warning' && "bg-warning",
                      program.color === 'danger' && "bg-danger",
                      program.color === 'neutral' && "bg-neutral"
                    )} />
                    <span className="text-sm font-medium">{program.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{program.percentage}%</div>
                    <div className="text-xs text-muted-foreground">{program.meals}M</div>
                  </div>
                </div>
                <Progress value={program.percentage} className={cn(
                  "h-2",
                  program.color === 'primary' && "[&>div]:bg-blue-500",
                  program.color === 'success' && "[&>div]:bg-green-500",
                  program.color === 'warning' && "[&>div]:bg-orange-500",
                  program.color === 'danger' && "[&>div]:bg-red-500",
                  program.color === 'neutral' && "[&>div]:bg-gray-500"
                )} />
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-primary">{mealsPerPerson}</div>
                <div className="text-xs text-muted-foreground">Meals per person</div>
              </div>
              <div>
                <div className="text-xl font-bold text-success">{dailyReach.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Daily reach</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Outcomes */}
      <Card className="executive-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Measured Outcomes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {impactMetrics.map((metric, index) => (
              <Card key={metric.label} className="bg-muted/30 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">{metric.label}</div>
                  <Badge 
                    variant="outline"
                    className={cn(
                      metric.color === 'success' && "text-success border-success",
                      metric.color === 'primary' && "text-primary border-primary"
                    )}
                  >
                    Positive
                  </Badge>
                </div>
                <div className="text-2xl font-bold">
                  {metric.value >= 1000 ? 
                    `${(metric.value / 1000).toFixed(0)}K` : 
                    metric.value
                  }
                  <span className="text-lg text-muted-foreground ml-1">{metric.unit}</span>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Global Recognition</span>
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className="text-primary border-primary mr-2">
                #{globalRanking} Largest Food Bank
              </Badge>
              <Badge variant="outline" className="text-success border-success">
                First Impact Evaluation in Egypt
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metric Modal */}
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