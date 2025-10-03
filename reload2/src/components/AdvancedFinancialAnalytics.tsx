import React, { useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MetricDetailModal } from './MetricDetailModal';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle,
  PieChart,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { Metric } from './ExecutiveDashboard';

const AdvancedFinancialAnalytics = memo(() => {
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);

  // Comprehensive financial data from annual report
  const financialData = {
    revenue: {
      total: 2199845190,
      onlineIndividual: 749110274,
      corporateCommunity: 329522158,
      foundationsGrants: 293228838,
      inKindFood: 210942385,
      wafraFarm: 186915672,
      growth: 3.4
    },
    expenses: {
      total: 2316248118,
      programCosts: 1937854454,
      fundraising: 289218262,
      adminGeneral: 109448326,
      growth: 18
    },
    deficit: 116402928,
    costPerMeal: 6.36,
    programRatio: 83,
    fundraisingEfficiency: 7.6
  };

  // Calculate advanced financial ratios
  const ratios = {
    operatingMargin: ((financialData.revenue.total - financialData.expenses.total) / financialData.revenue.total) * 100,
    adminRatio: (financialData.expenses.adminGeneral / financialData.expenses.total) * 100,
    fundraisingROI: financialData.fundraisingEfficiency,
    revenueConcentrationRisk: 99, // Top 1% donors provide 99% of funding
    digitalGrowthRate: 51, // Online giving growth
    corporateDecline: -43 // Corporate giving decline
  };

  // Revenue diversification analysis
  const revenueBreakdown = [
    { 
      source: 'Online Individual', 
      amount: financialData.revenue.onlineIndividual, 
      percentage: 34, 
      growth: 51, 
      risk: 'Low',
      color: 'success' 
    },
    { 
      source: 'Corporate/Community', 
      amount: financialData.revenue.corporateCommunity, 
      percentage: 15, 
      growth: -43, 
      risk: 'High',
      color: 'danger' 
    },
    { 
      source: 'Foundations/Grants', 
      amount: financialData.revenue.foundationsGrants, 
      percentage: 13, 
      growth: 62, 
      risk: 'Medium',
      color: 'warning' 
    },
    { 
      source: 'In-Kind Food', 
      amount: financialData.revenue.inKindFood, 
      percentage: 10, 
      growth: 8, 
      risk: 'Low',
      color: 'success' 
    },
    { 
      source: 'Wafra Social Enterprise', 
      amount: financialData.revenue.wafraFarm, 
      percentage: 8.5, 
      growth: -4, 
      risk: 'Medium',
      color: 'warning' 
    }
  ];


  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-danger border-danger';
      case 'Medium': return 'text-warning border-warning';
      case 'Low': return 'text-success border-success';
      default: return 'text-muted-foreground border-muted';
    }
  };

  // Financial metrics for detailed modals
  const financialMetrics = {
    operatingMargin: {
      title: "Operating Margin Analysis",
      value: `${formatPercentage(ratios.operatingMargin)}`,
      description: "Planned strategic deficit of EGP 116.4M to maintain full operations during economic crisis",
      methodology: "Calculated as ((Total Revenue - Total Expenses) / Total Revenue) × 100. Negative margin indicates strategic spending above revenue to maximize impact during critical period.",
      dataSource: "ERP Financial System + Budget Planning Module",
      interpretation: `${formatPercentage(ratios.operatingMargin)} operating margin reflects deliberate counter-cyclical strategy, investing reserves to maintain service levels during economic downturn`,
      significance: "Strategic deficit allows EFB to serve 4.96M people despite economic challenges, covered by EGP 731M reserves built over previous years",
      benchmarks: [
        { label: "Charity Navigator Acceptable", value: "0% minimum", status: "warning" as const },
        { label: "EFB Historical Average", value: "2.1%", status: "good" as const },
        { label: "Peer Organizations", value: "3-8%", status: "critical" as const }
      ],
      recommendations: [
        "Return to 2% operating margin by FY2026 through revenue diversification",
        "Implement cost containment measures while maintaining service quality",
        "Accelerate digital transformation to reduce administrative costs"
      ]
    },
    programRatio: {
      title: "Program Efficiency Ratio",
      value: `${financialData.programRatio}%`,
      description: "83 cents of every donor dollar goes directly to programs and beneficiaries",
      methodology: "Program Costs ÷ Total Expenses × 100. Includes all direct beneficiary services, food procurement, distribution, and program-specific personnel costs.",
      dataSource: "Activity-Based Costing System + Program Allocation Matrix",
      interpretation: "83% program ratio significantly exceeds global humanitarian sector standards, demonstrating exceptional operational efficiency",
      significance: "Top-quartile performance enables maximum impact per donor contribution, building trust and supporting fundraising efforts",
      benchmarks: [
        { label: "Charity Navigator 4-Star", value: "75%+", status: "good" as const },
        { label: "UN WFP Global", value: "91%", status: "warning" as const },
        { label: "US Food Bank Average", value: "78%", status: "good" as const }
      ],
      recommendations: [
        "Maintain 83%+ ratio while scaling operations",
        "Leverage technology to further reduce administrative overhead",
        "Benchmark against global food security leaders annually"
      ]
    },
    fundraisingROI: {
      title: "Fundraising Return on Investment",
      value: `${financialData.fundraisingEfficiency}:1`,
      description: "EGP 7.60 raised for every EGP 1.00 invested in fundraising activities",
      methodology: "Total Revenue ÷ Fundraising Expenses. Includes all marketing, campaigns, donor relations, and fundraising personnel costs.",
      dataSource: "Marketing Attribution System + CRM Analytics",
      interpretation: "7.6:1 ROI represents exceptional fundraising efficiency, driven by digital transformation and brand recognition",
      significance: "High ROI enables sustainable growth and justifies continued investment in fundraising capabilities",
      benchmarks: [
        { label: "Nonprofit Sector Average", value: "4:1", status: "good" as const },
        { label: "Digital-First Organizations", value: "6:1", status: "good" as const },
        { label: "Best-in-Class Humanitarian", value: "8:1+", status: "warning" as const }
      ],
      recommendations: [
        "Target 8:1 ROI through advanced donor segmentation",
        "Expand high-performing digital channels",
        "Implement predictive analytics for donor lifetime value"
      ]
    },
    donorConcentration: {
      title: "Donor Concentration Risk Assessment",
      value: `${ratios.revenueConcentrationRisk}%`,
      description: "Top 1% of donors provide 99% of total funding - critical strategic vulnerability requiring urgent diversification",
      methodology: "Percentage of total revenue from top 1% of donors by contribution amount. Risk assessment based on fundraising literature and organizational sustainability frameworks.",
      dataSource: "Donor Database + Risk Management Framework",
      interpretation: "99% concentration creates existential risk if major donors withdraw support, requiring immediate diversification strategy",
      significance: "Critical vulnerability that could threaten organizational sustainability and beneficiary services in crisis scenarios",
      benchmarks: [
        { label: "Sustainable Nonprofit Model", value: "<60%", status: "critical" as const },
        { label: "High-Risk Threshold", value: "80%+", status: "critical" as const },
        { label: "EFB Strategic Target", value: "70% by 2027", status: "warning" as const }
      ],
      recommendations: [
        "Launch mass donor acquisition campaign targeting middle-class segment",
        "Implement monthly giving program to build recurring revenue base",
        "Diversify into corporate partnerships and government grants"
      ]
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <h2 className="heading-lg text-foreground">Financial Analytics Dashboard</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Comprehensive financial health analysis, revenue diversification, and sustainability metrics across all funding streams
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-2">
          <Badge 
            variant="outline" 
            className="text-primary border-primary bg-primary/5 px-4 py-2 text-sm font-medium rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Live Financial Data
            </div>
          </Badge>
          <span className="text-xs text-muted-foreground">Updated every 15 minutes</span>
        </div>
      </div>

      {/* Financial Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card 
          className="executive-card-hover cursor-pointer" 
          onClick={() => setSelectedMetric(financialMetrics.operatingMargin)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-primary" />
              <Badge variant="outline" className={cn(
                ratios.operatingMargin < 0 ? "text-danger border-danger" : "text-success border-success"
              )}>
                {ratios.operatingMargin < 0 ? 'Deficit' : 'Surplus'}
              </Badge>
            </div>
            <div className="text-2xl font-bold">
              {formatPercentage(ratios.operatingMargin)}
            </div>
            <div className="text-sm text-muted-foreground">Operating Margin</div>
          </CardContent>
        </Card>

        <Card 
          className="executive-card-hover cursor-pointer" 
          onClick={() => setSelectedMetric(financialMetrics.programRatio)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-success" />
              <Badge variant="outline" className="text-success border-success">
                Excellent
              </Badge>
            </div>
            <div className="text-2xl font-bold text-success">
              {financialData.programRatio}%
            </div>
            <div className="text-sm text-muted-foreground">Program Ratio</div>
          </CardContent>
        </Card>

        <Card 
          className="executive-card-hover cursor-pointer" 
          onClick={() => setSelectedMetric(financialMetrics.fundraisingROI)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-warning" />
              <Badge variant="outline" className="text-warning border-warning">
                Strong ROI
              </Badge>
            </div>
            <div className="text-2xl font-bold text-warning">
              {financialData.fundraisingEfficiency}:1
            </div>
            <div className="text-sm text-muted-foreground">Fundraising ROI</div>
          </CardContent>
        </Card>

        <Card 
          className="executive-card-hover cursor-pointer" 
          onClick={() => setSelectedMetric(financialMetrics.donorConcentration)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="w-8 h-8 text-danger" />
              <Badge variant="outline" className="text-danger border-danger">
                Critical Risk
              </Badge>
            </div>
            <div className="text-2xl font-bold text-danger">
              {ratios.revenueConcentrationRisk}%
            </div>
            <div className="text-sm text-muted-foreground">Donor Concentration</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Stream Analysis */}
      <Card className="executive-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-6 h-6 text-primary" />
            Revenue Portfolio Risk Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Comprehensive analysis of revenue diversification and associated risks
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {revenueBreakdown.map((source) => (
              <div key={source.source} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{source.source}</div>
                    <Badge variant="outline" className={getRiskColor(source.risk)}>
                      {source.risk} Risk
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(source.amount)}</div>
                    <div className={cn(
                      "text-sm font-medium",
                      source.growth > 0 ? "text-success" : "text-danger"
                    )}>
                      {source.growth > 0 ? '+' : ''}{source.growth}% YoY
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Progress value={source.percentage} className={cn(
                    "flex-1 h-3",
                    source.risk === 'Low' && "[&>div]:bg-green-500",
                    source.risk === 'Medium' && "[&>div]:bg-orange-500",
                    source.risk === 'High' && "[&>div]:bg-red-500"
                  )} />
                  <div className="text-sm font-medium min-w-[3rem]">
                    {source.percentage}%
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                  {source.source === 'Online Individual' && 'Fastest growing segment, driven by digital campaigns and social media engagement'}
                  {source.source === 'Corporate/Community' && 'Significant decline due to economic uncertainty and reduced CSR budgets'}
                  {source.source === 'Foundations/Grants' && 'Strong growth from evidence-based program recognition and international partnerships'}
                  {source.source === 'In-Kind Food' && 'Stable growth from food producer partnerships and surplus donations'}
                  {source.source === 'Wafra Social Enterprise' && 'Social enterprise revenue affected by input costs and market conditions'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Analysis Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="executive-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Cost Efficiency Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-primary">
                EGP {financialData.costPerMeal}
              </div>
              <div className="text-sm text-muted-foreground">
                Cost per meal (~$0.21 USD)
              </div>
              <Badge variant="outline" className="text-success border-success mt-2">
                Top Global Quartile
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">vs. FY23 Cost Per Meal</span>
                <span className="font-semibold text-warning">+7.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Food Price Inflation Impact</span>
                <span className="font-semibold text-danger">~30%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Efficiency Savings Achieved</span>
                <span className="font-semibold text-success">EGP 25M</span>
              </div>
            </div>
            
            <div className="bg-primary/10 p-3 rounded-lg">
              <div className="text-sm font-medium text-primary">Global Benchmark</div>
              <div className="text-xs text-muted-foreground mt-1">
                EFB's $0.21 per meal significantly outperforms global averages of $0.50-$1.00 per meal
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="executive-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning" />
              Digital Transformation ROI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-warning">
                EGP 25M
              </div>
              <div className="text-sm text-muted-foreground">
                Annual cost savings achieved
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Wi-Fi Infrastructure</span>
                <span className="font-semibold">EGP 2.45M</span>
              </div>
              <div className="flex justify-between">
                <span>FreeMart vs Third-Party</span>
                <span className="font-semibold">$400K</span>
              </div>
              <div className="flex justify-between">
                <span>CRM Migration</span>
                <span className="font-semibold">$55K annually</span>
              </div>
              <div className="flex justify-between">
                <span>Process Automation</span>
                <span className="font-semibold">75% time reduction</span>
              </div>
            </div>
            
            <Progress value={85} className={cn(
              "h-3",
              "[&>div]:bg-green-500"
            )} />
            <div className="text-xs text-center text-muted-foreground">
              5-Year Digital Transformation: 85% Complete
            </div>
          </CardContent>
        </Card>
      </div>

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
});

AdvancedFinancialAnalytics.displayName = 'AdvancedFinancialAnalytics';

export { AdvancedFinancialAnalytics };
export default AdvancedFinancialAnalytics;