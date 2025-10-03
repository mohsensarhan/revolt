import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  GraduationCap, 
  Heart, 
  Users, 
  Target,
  TrendingUp,
  Calendar,
  Award,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MetricDetailModal } from './MetricDetailModal';
import { cn } from '@/lib/utils';

interface ProgramMetric {
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

export function ProgramsAnalytics() {
  const [selectedMetric, setSelectedMetric] = useState<ProgramMetric | null>(null);

  const programMetrics = [
    {
      title: "Stunting Prevention Impact",
      value: "14% → 2%",
      description: "Reduction in child stunting rates in targeted communities",
      methodology: "Longitudinal cohort study tracking 12,847 children over 24 months using WHO growth standards. Pre/post intervention comparison with control groups.",
      dataSource: "Ministry of Health Partnership + EFB Field Monitoring Teams",
      interpretation: "86% relative reduction in stunting demonstrates exceptional program effectiveness, surpassing global best practices",
      significance: "This outcome represents prevention of 15,647 cases of chronic malnutrition, with lifetime economic value of EGP 2.1B",
      benchmarks: [
        { label: "WHO Global Target 2030", value: "15% reduction", status: "good" as const },
        { label: "UNICEF Best Practice", value: "25% reduction", status: "good" as const },
        { label: "EFB Achievement", value: "86% reduction", status: "good" as const }
      ],
      recommendations: [
        "Scale intervention model to additional 10 governorates",
        "Integrate digital health monitoring platform",
        "Establish long-term tracking cohort for impact assessment"
      ]
    },
    {
      title: "School Feeding Coverage",
      value: "125,000",
      description: "Students receiving daily nutritious meals in targeted schools",
      methodology: "Direct count of enrolled students in 512 participating schools across 15 governorates, verified through biometric attendance systems.",
      dataSource: "Ministry of Education Partnership + School Attendance Records",
      interpretation: "125K students represent 3.2% of Egypt's total primary school population, with 94% attendance improvement in participating schools",
      significance: "Program demonstrates 23% improvement in learning outcomes and 31% reduction in dropout rates",
      benchmarks: [
        { label: "UN SDG 4 Target", value: "Universal Coverage", status: "warning" as const },
        { label: "Regional Average", value: "45K students", status: "good" as const },
        { label: "EFB Scale Achievement", value: "125K students", status: "good" as const }
      ],
      recommendations: [
        "Expand to 200 additional schools by FY2026",
        "Implement nutrition education curriculum",
        "Launch parent engagement digital platform"
      ]
    }
  ];

  const programBreakdown = [
    {
      name: "Protection Programs",
      beneficiaries: 4890000,
      percentage: 98.6,
      icon: <Shield className="w-5 h-5" />,
      color: "success",
      description: "Emergency food assistance and monthly food boxes",
      interventions: [
        { name: "Monthly Food Boxes", beneficiaries: 3200000, cost: "EGP 1.2B" },
        { name: "Ramadan Campaign", beneficiaries: 2400000, cost: "EGP 456M" },
        { name: "Emergency Relief", beneficiaries: 890000, cost: "EGP 234M" },
        { name: "Remote Area Convoys", beneficiaries: 400000, cost: "EGP 89M" }
      ]
    },
    {
      name: "Prevention Programs", 
      beneficiaries: 72000,
      percentage: 1.45,
      icon: <Heart className="w-5 h-5" />,
      color: "warning",
      description: "Nutrition education and health promotion",
      interventions: [
        { name: "Maternal Nutrition", beneficiaries: 28000, cost: "EGP 23M" },
        { name: "Child Growth Monitoring", beneficiaries: 31000, cost: "EGP 18M" },
        { name: "Community Health Education", beneficiaries: 13000, cost: "EGP 8M" }
      ]
    },
    {
      name: "Empowerment Programs",
      beneficiaries: 6400,
      percentage: 0.13,
      icon: <GraduationCap className="w-5 h-5" />,
      color: "primary",
      description: "Skills training and income generation",
      interventions: [
        { name: "Vocational Training", beneficiaries: 3200, cost: "EGP 12M" },
        { name: "Microfinance Support", beneficiaries: 2100, cost: "EGP 8M" },
        { name: "Women's Cooperatives", beneficiaries: 1100, cost: "EGP 4M" }
      ]
    }
  ];

  const impactMeasurements = [
    {
      metric: "Dietary Diversity Score",
      baseline: 3.2,
      current: 6.8,
      improvement: 112.5,
      target: 7.0,
      unit: "food groups"
    },
    {
      metric: "Food Security Score",
      baseline: 42,
      current: 78,
      improvement: 85.7,
      target: 80,
      unit: "index points"
    },
    {
      metric: "Child Malnutrition Rate",
      baseline: 23.1,
      current: 8.4,
      improvement: -63.6,
      target: 5.0,
      unit: "%"
    },
    {
      metric: "Household Resilience Index",
      baseline: 2.8,
      current: 7.2,
      improvement: 157.1,
      target: 7.5,
      unit: "resilience score"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading-lg text-foreground mb-2">Programs Impact Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis of Protection, Prevention, and Empowerment program outcomes
          </p>
        </div>
        <Badge variant="outline" className="text-primary border-primary">
          4.97M Beneficiaries
        </Badge>
      </div>

      {/* Key Program Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {programMetrics.map((metric) => (
          <Card 
            key={metric.title}
            className="executive-card cursor-pointer hover:shadow-lg transition-all duration-200"
            onClick={() => setSelectedMetric(metric)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-md bg-success/10 text-success">
                    <Award className="w-5 h-5" />
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
                <div className="text-sm text-success flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Exceeds Global Standards
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Program Breakdown Tabs */}
      <Card className="executive-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Three Pillars Program Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Detailed breakdown of Protection, Prevention, and Empowerment interventions
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="protection">Protection</TabsTrigger>
              <TabsTrigger value="prevention">Prevention</TabsTrigger>
              <TabsTrigger value="empowerment">Empowerment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {programBreakdown.map((program) => (
                  <div key={program.name} className="p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-2 rounded-md ${
                        program.color === 'success' ? 'bg-success/10 text-success' : 
                        program.color === 'warning' ? 'bg-warning/10 text-warning' : 
                        'bg-primary/10 text-primary'
                      }`}>
                        {program.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold">{program.name}</h4>
                        <p className="text-xs text-muted-foreground">{program.description}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Beneficiaries</span>
                        <span className="font-semibold">{program.beneficiaries.toLocaleString()}</span>
                      </div>
                      <Progress value={program.percentage} className={cn(
                        "h-2",
                        program.color === 'success' && "[&>div]:bg-green-500",
                        program.color === 'warning' && "[&>div]:bg-orange-500",
                        program.color === 'primary' && "[&>div]:bg-blue-500"
                      )} />
                      <div className="text-xs text-muted-foreground">
                        {program.percentage.toFixed(1)}% of total program reach
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {programBreakdown.map((program) => (
              <TabsContent key={program.name} value={program.name.toLowerCase().split(' ')[0]} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 rounded-md ${
                      program.color === 'success' ? 'bg-success/10 text-success' : 
                      program.color === 'warning' ? 'bg-warning/10 text-warning' : 
                      'bg-primary/10 text-primary'
                    }`}>
                      {program.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{program.name}</h3>
                      <p className="text-sm text-muted-foreground">{program.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {program.interventions.map((intervention, idx) => (
                      <div key={idx} className="p-3 bg-muted/10 rounded-md">
                        <h4 className="font-medium mb-2">{intervention.name}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Beneficiaries:</span>
                            <span className="font-semibold">{intervention.beneficiaries.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Annual Cost:</span>
                            <span className="font-semibold">{intervention.cost}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Impact Measurements */}
      <Card className="executive-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Evidence-Based Impact Measurements
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Quantified outcomes across key nutrition and food security indicators
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {impactMeasurements.map((impact) => (
              <div key={impact.metric} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{impact.metric}</span>
                  <Badge variant={impact.improvement > 0 ? 'default' : 'secondary'}>
                    {impact.improvement > 0 ? '+' : ''}{impact.improvement.toFixed(1)}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Baseline: {impact.baseline} {impact.unit}</span>
                    <span>Current: {impact.current} {impact.unit}</span>
                  </div>
                    <Progress 
                      value={(impact.current / impact.target) * 100} 
                      className={cn(
                        "h-2",
                        (impact.current / impact.target) >= 0.9 && "[&>div]:bg-green-500",
                        (impact.current / impact.target) >= 0.7 && (impact.current / impact.target) < 0.9 && "[&>div]:bg-orange-500",
                        (impact.current / impact.target) < 0.7 && "[&>div]:bg-red-500"
                      )}
                    />
                  <div className="text-xs text-muted-foreground">
                    Target: {impact.target} {impact.unit} • 
                    {((impact.current / impact.target) * 100).toFixed(1)}% of target achieved
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Stories Highlights */}
      <Card className="executive-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Program Success Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-success/5 rounded-lg border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span className="font-semibold text-success">Nutrition Transformation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                86% reduction in child stunting rates exceeds all global benchmarks, 
                preventing 15,647 cases of chronic malnutrition with EGP 2.1B lifetime economic value.
              </p>
            </div>
            
            <div className="p-4 bg-warning/5 rounded-lg border border-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5 text-warning" />
                <span className="font-semibold text-warning">Education Impact</span>
              </div>
              <p className="text-sm text-muted-foreground">
                School feeding program shows 23% improvement in learning outcomes 
                and 31% reduction in dropout rates across 512 participating schools.
              </p>
            </div>
            
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">Empowerment Success</span>
              </div>
              <p className="text-sm text-muted-foreground">
                6,400 individuals gained sustainable livelihood skills with 78% job placement rate 
                and 145% average income increase within 12 months.
              </p>
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

export default ProgramsAnalytics;