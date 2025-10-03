import React, { useState, useCallback, useRef, useMemo, Suspense, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, Users, Globe, DollarSign, Target, TriangleAlert as AlertTriangle, Activity, ChartBar as BarChart3, Brain, Lightbulb, Info } from 'lucide-react';
import efbLogo from '@/assets/efb-logo.png';
import { MetricCard } from './MetricCard';
import { FinancialHealthGrid } from './FinancialHealthGrid';
import { ImpactAnalytics } from './ImpactAnalytics';
import { ReportNavigation } from './ReportNavigation';
import { DashboardLayout } from './DashboardLayout';
import { MetricDetailModal } from './MetricDetailModal';
import { ProgrammaticAnalysis } from './ProgrammaticAnalysis';
import { ScenarioModelModal } from './ScenarioModelModal';
import { ErrorBoundary } from './ErrorBoundary';
import { PageLoadingSkeleton, AnalyticsSkeleton } from './LoadingStates';
import { useViewportScale } from '@/hooks/useViewportScale';
import { useDebounce } from '@/hooks/useDebounce';
import { useAutoGrid } from '@/hooks/useAutoGrid';
import { useScenarioCalculations } from '@/hooks/useScenarioCalculations';
import { dataService } from '@/lib/data-service';
import { formatSimpleNumber, formatPercentage, formatCurrency, formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { GrowthTrajectoryChart } from './GrowthTrajectoryChart';
import { 
  LazyAdvancedFinancialAnalytics,
  LazyOperationalAnalytics,
  LazyProgramsAnalytics,
  LazyStakeholderAnalytics,
  LazyScenarioAnalysis,
  LazyComponentWrapper
} from './LazyComponents';
import { GlobalSignalsSection } from './GlobalSignalsSection';
import { PageGrid } from '@/layout/PageGrid';

export interface Metric {
  title: string;
  value: number | string;
  description: string;
  methodology: string;
  dataSource: string;
  interpretation: string;
  benchmarks?: Array<{ label: string; value: string; status: 'good' | 'warning' | 'critical' }>;
  factors?: Array<{ factor: string; impact: string }>;
  formula?: string;
  significance: string;
  recommendations?: string[];
}

interface DashboardMetrics {
  mealsDelivered: number;
  peopleServed: number;
  costPerMeal: number;
  programEfficiency: number;
  revenue: number;
  expenses: number;
  reserves: number;
  cashPosition: number;
}

const baseMetrics: DashboardMetrics = {
  mealsDelivered: 367490721,
  peopleServed: 4960000,
  costPerMeal: 6.36,
  programEfficiency: 83,
  revenue: 2200000000,
  expenses: 2316000000,
  reserves: 731200000,
  cashPosition: 459800000,
};

const ExecutiveDashboard = memo(() => {
  // State for live metrics from database
  const [liveMetrics, setLiveMetrics] = useState<DashboardMetrics>(baseMetrics);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  // Fetch live metrics from database
  React.useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const metrics = await dataService.getExecutiveMetrics();
        if (metrics) {
          setLiveMetrics({
            mealsDelivered: metrics.meals_delivered,
            peopleServed: metrics.people_served,
            costPerMeal: metrics.cost_per_meal,
            programEfficiency: metrics.program_efficiency,
            revenue: metrics.revenue,
            expenses: metrics.expenses,
            reserves: metrics.reserves,
            cashPosition: metrics.cash_position,
          });
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    fetchMetrics();

    // Subscribe to real-time updates
    const unsubscribe = dataService.subscribeToExecutiveMetrics((metrics) => {
      setLiveMetrics({
        mealsDelivered: metrics.meals_delivered,
        peopleServed: metrics.people_served,
        costPerMeal: metrics.cost_per_meal,
        programEfficiency: metrics.program_efficiency,
        revenue: metrics.revenue,
        expenses: metrics.expenses,
        reserves: metrics.reserves,
        cashPosition: metrics.cash_position,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Get initial section from URL or default to 'executive'
  const getInitialSection = () => {
    const hash = window.location.hash.replace('#', '');
    const validSections = ['executive', 'financial', 'operational', 'programs', 'stakeholders', 'scenarios'];
    return validSections.includes(hash) ? hash : 'executive';
  };
  
  const [currentSection, setCurrentSection] = useState(getInitialSection);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModelModal, setShowModelModal] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [scenarioFactors, setScenarioFactors] = useState({
    economicGrowth: 0,
    inflationRate: 0,
    donorSentiment: 0,
    operationalEfficiency: 0,
    foodPrices: 0,
    unemploymentRate: 0,
    corporateCSR: 0,
    governmentSupport: 0,
    exchangeRateEGP: 0,
    logisticsCostIndex: 0,
    regionalShock: 0,
  });

  // Debounce scenario factors to prevent excessive calculations
  const debouncedScenarioFactors = useDebounce(scenarioFactors, 50);

  // Update URL when section changes
  const handleSectionChange = (sectionId: string) => {
    setCurrentSection(sectionId);
    window.history.replaceState(null, '', `#${sectionId}`);
  };

  // Load metrics from Supabase
  React.useEffect(() => {
    const loadMetrics = async () => {
      try {
        console.log('📊 Dashboard: Loading initial metrics...');
        const metricsData = await dataService.getExecutiveMetrics();
        if (metricsData) {
          console.log('✅ Dashboard: Initial metrics loaded:', metricsData);
          setMetrics(metricsData);
          // Set scenario factors from stored data
          if (metricsData.scenario_factors) {
            setScenarioFactors(prev => ({ ...prev, ...metricsData.scenario_factors }));
          }
        }
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();

    // Set up real-time subscription
    const unsubscribe = dataService.subscribeToExecutiveMetrics((updatedMetrics) => {
      console.log('📡 Dashboard: Real-time update received:', updatedMetrics);
      console.log('📡 Dashboard: Updated metrics data:', {
        people_served: updatedMetrics.people_served,
        meals_delivered: updatedMetrics.meals_delivered,
        cost_per_meal: updatedMetrics.cost_per_meal,
        program_efficiency: updatedMetrics.program_efficiency,
        revenue: updatedMetrics.revenue,
        expenses: updatedMetrics.expenses,
        reserves: updatedMetrics.reserves,
        cash_position: updatedMetrics.cash_position,
        coverage_governorates: updatedMetrics.coverage_governorates
      });
      
      setMetrics(updatedMetrics);
      
      if (updatedMetrics.scenario_factors) {
        console.log('📡 Dashboard: Updating scenario factors:', updatedMetrics.scenario_factors);
        setScenarioFactors(prev => ({ ...prev, ...updatedMetrics.scenario_factors }));
      }
      
      // Force a re-render to ensure UI updates
      const event = new CustomEvent('metricsUpdated', { detail: updatedMetrics });
      window.dispatchEvent(event);
    });

    return () => {
      if (unsubscribe) {
        console.log('📡 Dashboard: Unsubscribing from real-time updates');
        unsubscribe();
      }
    };
  }, []);

  // Listen for browser back/forward navigation
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validSections = ['executive', 'financial', 'operational', 'programs', 'stakeholders', 'scenarios'];
      if (validSections.includes(hash)) {
        setCurrentSection(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Listen for global metrics update events
  React.useEffect(() => {
    const handleMetricsUpdate = (event: CustomEvent) => {
      console.log('📡 Dashboard: Global metrics update event received:', event.detail);
      if (event.detail) {
        setMetrics(event.detail);
      }
    };

    window.addEventListener('metricsUpdated', handleMetricsUpdate as EventListener);
    return () => {
      window.removeEventListener('metricsUpdated', handleMetricsUpdate as EventListener);
    };
  }, []);

  // Scaling system integration
  const headerRef = useRef<HTMLElement>(null);
  const scale = useViewportScale(headerRef);
  useAutoGrid();

  // Use the enhanced scenario calculations hook for dynamic updates
  const calculatedMetrics = useScenarioCalculations(liveMetrics, debouncedScenarioFactors);

  // Add a separate effect to ensure calculated metrics update when raw metrics change
  React.useEffect(() => {
    if (metrics) {
      console.log('📊 Dashboard: Raw metrics updated, recalculating...', metrics);
      // Force recalculation by updating a dummy state
      setMetrics({ ...metrics });
    }
  }, [metrics]);

  const updateScenario = useCallback((factor: string, value: number[]) => {
    setScenarioFactors(prev => ({ ...prev, [factor]: value[0] }));
  }, []);

  // Executive metrics for detailed modals
  const executiveMetrics = {
    livesImpacted: {
      title: "Lives Impacted Analysis",
      value: `${formatSimpleNumber(calculatedMetrics?.peopleServed || liveMetrics.peopleServed)} people`,
      description: "4.96 million unique individuals reached nationwide across all 27 governorates",
      methodology: "Unique beneficiary identification using national ID verification system, preventing double-counting across multiple programs and time periods.",
      dataSource: "National Beneficiary Database + Ministry of Social Solidarity Integration",
      interpretation: "4.96M represents 4.8% of Egypt's total population, focusing on most vulnerable households identified through poverty mapping",
      significance: "Largest humanitarian reach in Egypt's history, exceeding government social protection programs in coverage and efficiency",
      benchmarks: [
        { label: "UN WFP Egypt Operations", value: "2.1M people", status: "good" as const },
        { label: "Government Takaful Program", value: "3.2M people", status: "good" as const },
        { label: "EFB Achievement", value: "4.96M people", status: "good" as const }
      ],
      recommendations: [
        "Scale to reach 6M people by FY2026 through enhanced partnerships",
        "Implement graduated exit strategies for improved households",
        "Expand prevention programs to reduce future emergency needs"
      ]
    },
    mealsDelivered: {
      title: "Meals Delivered Impact Assessment", 
      value: `${formatSimpleNumber(calculatedMetrics?.mealsDelivered || liveMetrics.mealsDelivered)} meals`,
      description: "Total annual food assistance across protection, prevention, and empowerment programs",
      methodology: "Comprehensive meal equivalent calculation using WHO nutritional standards, verified through biometric distribution tracking and partner reporting.",
      dataSource: "Distribution Management System + Partner Network Reports + Field Verification",
      interpretation: "367.5M meals represents 72 meals per beneficiary annually, equivalent to providing complete nutrition for 1 million people daily",
      significance: "Largest food distribution operation in MENA region, preventing acute malnutrition crisis during economic downturn",
      benchmarks: [
        { label: "Regional Food Banks Average", value: "50M meals/year", status: "good" as const },
        { label: "Global Top 10 Food Banks", value: "200M meals/year", status: "good" as const },
        { label: "EFB World Ranking", value: "#3 globally", status: "good" as const }
      ],
      recommendations: [
        "Optimize meal composition for enhanced nutritional value",
        "Implement seasonal demand forecasting for distribution efficiency",
        "Develop supply chain resilience for 400M+ meal target"
      ]
    },
    costPerMeal: {
      title: "Cost Efficiency Excellence",
      value: `${formatCurrency(calculatedMetrics?.costPerMeal || liveMetrics.costPerMeal)} per meal`,
      description: "All-inclusive program cost including food, logistics, administration, and monitoring",
      methodology: "Activity-based costing system allocating all organizational expenses across meals delivered, including overhead, quality assurance, and impact measurement.",
      dataSource: "ERP Financial System + Time-Driven Activity Based Costing Model",
      interpretation: "EGP 6.36 (~$0.21 USD) per meal represents world-class efficiency, 70% below global humanitarian sector average",
      significance: "Exceptional cost efficiency maximizes donor impact and enables sustainable scale expansion during economic challenges",
      benchmarks: [
        { label: "Global Humanitarian Average", value: "$0.70 per meal", status: "good" as const },
        { label: "USAID Cost Standard", value: "$0.45 per meal", status: "good" as const },
        { label: "EFB Performance", value: "$0.21 per meal", status: "good" as const }
      ],
      recommendations: [
        "Leverage AI for supply chain optimization to reach $0.19 per meal",
        "Expand local sourcing to reduce logistics costs",
        "Implement blockchain for transparency and efficiency gains"
      ]
    },
    coverage: {
      title: "Geographic Coverage Achievement",
      value: "27/27 Governorates",
      description: "Complete national coverage across Egypt's 27 governorates with 5,000+ partners",
      methodology: "Geographic Information Systems mapping of service delivery points combined with population density analysis and accessibility metrics.",
      dataSource: "Partner Network Database + Government Administrative Records + Field Operations",
      interpretation: "100% governorate coverage with 87% average population accessibility represents unmatched humanitarian reach",
      significance: "Universal coverage ensures equitable access regardless of geographic location, critical for national food security",
      benchmarks: [
        { label: "Government Social Programs", value: "22/27 governorates", status: "good" as const },
        { label: "International NGOs Average", value: "12 governorates", status: "good" as const },
        { label: "EFB Unique Achievement", value: "27/27 governorates", status: "good" as const }
      ],
      recommendations: [
        "Establish permanent centers in remote regions",
        "Enhance mobile unit coverage for nomadic populations",
        "Implement satellite monitoring for unreachable areas"
      ]
    }
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'executive':
        return (
          <div className="space-y-8">
            {/* Story Arc Navigation */}
            <Card className="bg-gradient-to-r from-primary/5 via-success/5 to-warning/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="font-medium text-foreground">Executive Story Flow:</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="font-semibold text-primary">What</span> we achieved
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1">
                      <span className="font-semibold text-primary">Why</span> it matters
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1">
                      <span className="font-semibold text-primary">How</span> we're growing
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1">
                      <span className="font-semibold text-primary">What's</span> next
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 1. ACHIEVEMENT - Key Performance Indicators */}
            <section>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-primary border-primary">1. What We Achieved</Badge>
                </div>
                <h2 className="heading-lg flex items-center gap-3">
                  <Target className="w-6 h-6 text-primary" />
                  Strategic Impact Overview
                </h2>
                <p className="text-muted-foreground mt-2">
                  Record-breaking humanitarian achievement: 4.96M lives impacted through 367.5M meals delivered across all of Egypt
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Lives Impacted"
                  value={calculatedMetrics?.peopleServed || liveMetrics.peopleServed}
                  format="number"
                  suffix="people"
                  change="+43% CAGR"
                  trend="up"
                  icon={<Users className="w-6 h-6" />}
                  color="success"
                  description="Unique individuals reached nationwide"
                  onClick={() => setSelectedMetric(executiveMetrics.livesImpacted)}
                />
                
                <MetricCard
                  title="Meals Delivered"
                  value={calculatedMetrics?.mealsDelivered || liveMetrics.mealsDelivered}
                  format="number"
                  suffix="meals"
                  change="+40% YoY"
                  trend="up"
                  icon={<Target className="w-6 h-6" />}
                  color="neutral"
                  description="Total annual food assistance"
                  onClick={() => setSelectedMetric(executiveMetrics.mealsDelivered)}
                />
                
                <MetricCard
                  title="Cost Per Meal"
                  value={calculatedMetrics?.costPerMeal || liveMetrics.costPerMeal}
                  format="currency"
                  prefix="EGP"
                  change="83% ratio"
                  trend="stable"
                  icon={<DollarSign className="w-6 h-6" />}
                  color="warning"
                  description="All-inclusive program cost"
                  onClick={() => setSelectedMetric(executiveMetrics.costPerMeal)}
                />
                
                <MetricCard
                  title="Coverage"
                  value={27}
                  suffix="/27"
                  format="simple"
                  change="100% coverage"
                  trend="up"
                  icon={<Globe className="w-6 h-6" />}
                  color="danger"
                  description="Governorates reached"
                  onClick={() => setSelectedMetric(executiveMetrics.coverage)}
                />
              </div>
            </section>

            {/* 2. CONTEXT - Global & Egypt Operating Environment */}
            <section id="global-indicators">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-primary border-primary">2. Why It Matters</Badge>
                </div>
                <h2 className="heading-lg flex items-center gap-3">
                  <Globe className="w-6 h-6 text-primary" />
                  Operating in Crisis: Egypt's Economic Reality
                </h2>
                <p className="text-muted-foreground mt-2">
                  Understanding the challenging context: soaring food prices, currency pressure, and rising food insecurity driving unprecedented demand
                </p>
              </div>
              <GlobalSignalsSection />
            </section>

            {/* 3. TRAJECTORY - Growth & Strategic Expansion */}
            <section>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-primary border-primary">3. How We're Growing</Badge>
                </div>
                <h2 className="heading-lg flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  5-Year Growth Trajectory: From Regional Leader to Global Force
                </h2>
                <p className="text-muted-foreground mt-2">
                  Exceptional expansion trajectory achieving 43% CAGR despite economic headwinds - reaching global #3 ranking
                </p>
              </div>

              <GrowthTrajectoryChart />
            </section>

            {/* 4. SUSTAINABILITY - Financial Health Analysis */}
            <section>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-success border-success">Financial Foundation</Badge>
                </div>
                <h2 className="heading-lg flex items-center gap-3">
                  <Activity className="w-6 h-6 text-success" />
                  Financial Sustainability & Resource Management
                </h2>
                <p className="text-muted-foreground mt-2">
                  Strategic deficit of EGP 116M maintains full operations during crisis, covered by reserves built over previous years
                </p>
              </div>
              
              <ErrorBoundary>
                <FinancialHealthGrid metrics={calculatedMetrics || baseMetrics} />
              </ErrorBoundary>
            </section>


            {/* 5. EXECUTION - Operational Impact Delivery */}
            <section>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-warning border-warning">Execution Excellence</Badge>
                </div>
                <h2 className="heading-lg flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-warning" />
                  How We Deliver: Operational Excellence at Scale
                </h2>
                <p className="text-muted-foreground mt-2">
                  World-class cost efficiency of EGP 6.36 per meal through 27/27 governorate coverage and optimized program mix
                </p>
              </div>

              <ImpactAnalytics metrics={calculatedMetrics || baseMetrics} />
            </section>

            {/* 6. STRATEGIC DIRECTION - Executive Action Items */}
            <section>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-primary border-primary">4. What's Next</Badge>
                </div>
                <h2 className="heading-lg flex items-center gap-3">
                  <Lightbulb className="w-6 h-6 text-primary-glow" />
                  Strategic Roadmap & Executive Actions
                </h2>
                <p className="text-muted-foreground mt-2">
                  Data-driven priorities for scaling to 6M beneficiaries while addressing critical risks and innovation opportunities
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="executive-card">
                  <CardHeader>
                    <CardTitle className="text-success flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Growth Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-2">
                      <div>• Scale to 6M beneficiaries by FY2026</div>
                      <div>• Expand into 3 additional countries</div>
                      <div>• Launch prevention programs in urban areas</div>
                      <div>• Implement AI-driven supply chain optimization</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="executive-card">
                  <CardHeader>
                    <CardTitle className="text-warning flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Risk Mitigation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-2">
                      <div>• Diversify funding sources beyond 60%</div>
                      <div>• Build 6-month operational reserves</div>
                      <div>• Develop crisis response protocols</div>
                      <div>• Strengthen government partnerships</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="executive-card">
                  <CardHeader>
                    <CardTitle className="text-primary flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Innovation Priorities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-2">
                      <div>• Deploy blockchain for transparency</div>
                      <div>• Launch mobile nutrition education</div>
                      <div>• Implement biometric beneficiary tracking</div>
                      <div>• Develop predictive demand modeling</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Executive Summary Modal */}
            {selectedMetric && (
              <MetricDetailModal 
                isOpen={!!selectedMetric}
                onClose={() => setSelectedMetric(null)}
                metric={selectedMetric}
              />
            )}
          </div>
        );
      case 'financial':
        return (
          <LazyComponentWrapper>
            <LazyAdvancedFinancialAnalytics />
          </LazyComponentWrapper>
        );
      case 'operational':
        return (
          <LazyComponentWrapper>
            <LazyOperationalAnalytics />
          </LazyComponentWrapper>
        );
      case 'programs':
        return (
          <LazyComponentWrapper>
            <LazyProgramsAnalytics />
          </LazyComponentWrapper>
        );
      case 'stakeholders':
        return (
          <LazyComponentWrapper>
            <LazyStakeholderAnalytics />
          </LazyComponentWrapper>
        );
      case 'scenarios':
        return (
          <div className="space-y-8">
                   {/* Sticky Header with Model Info Button */}
                   <div className="sticky top-0 z-50 bg-background/98 backdrop-blur-md border border-border rounded-lg p-1 sm:p-4 lg:p-6 transition-all duration-200 overflow-hidden shadow-lg -mx-3 sm:-mx-6 mx-0">
                     <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                       <div className="flex-1">
                         <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                           <div className="p-2 bg-primary/10 rounded-lg">
                             <Brain className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                           </div>
                           <h2 className="text-sm sm:text-xl lg:text-2xl font-semibold text-foreground">Advanced Scenario Modeling</h2>
                         </div>
                         <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-full sm:max-w-2xl hidden sm:block">
                           Interactive econometric modeling with 89.3% forecast accuracy. Adjust variables to explore different scenarios and their impact on EFB operations.
                         </p>
                       </div>
                       <div className="flex flex-col sm:items-end gap-2">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => setShowModelModal(true)}
                           className="text-primary border-primary hover:bg-primary/5 text-xs sm:text-sm px-2 sm:px-4"
                         >
                           <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                           Model Details
                         </Button>
                         <span className="text-xs text-muted-foreground hidden sm:inline">Last calibrated: Dec 2024</span>
                       </div>
                     </div>

                     
                     {/* Integrated Live Impact Summary - Only sticky on desktop */}
                     <div className="mt-2 sm:mt-6 pt-2 sm:pt-6 border-t border-border">
                       {/* Live indicator */}
                       <div className="flex items-center justify-center mb-2 sm:mb-4">
                         <div className="flex items-center gap-2 px-3 py-1 bg-success/10 border border-success/30 rounded-full">
                           <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                           <span className="text-xs font-medium text-success">Live Updates</span>
                         </div>
                       </div>
                       
                       {/* All 11 Metrics - Completely Uniform Styling */}
                       <div className="grid grid-cols-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-1 sm:gap-2 lg:gap-3 overflow-hidden">
                         {/* Primary Metrics - All with identical styling */}
                         <div className="text-center p-1 sm:p-2 lg:p-3 bg-success/10 rounded border border-success/30 shadow-sm transition-all duration-300 hover:shadow-md min-w-0">
                           <div className="text-xs sm:text-lg lg:text-xl font-bold text-success transition-all duration-200">
                             {formatNumber(calculatedMetrics?.peopleServed || liveMetrics.peopleServed)}
                           </div>
                           <div className="text-xs text-muted-foreground font-medium truncate hidden sm:block">People</div>
                           <div className="text-xs text-muted-foreground font-medium truncate sm:hidden">P</div>
                         </div>
                         <div className="text-center p-1 sm:p-2 lg:p-3 bg-primary/10 rounded border border-primary/30 shadow-sm transition-all duration-300 hover:shadow-md min-w-0">
                           <div className="text-xs sm:text-lg lg:text-xl font-bold text-primary transition-all duration-200">
                             {formatNumber(calculatedMetrics?.mealsDelivered || liveMetrics.mealsDelivered)}
                           </div>
                           <div className="text-xs text-muted-foreground font-medium truncate hidden sm:block">Meals</div>
                           <div className="text-xs text-muted-foreground font-medium truncate sm:hidden">M</div>
                         </div>
                         <div className="text-center p-1 sm:p-2 lg:p-3 bg-warning/10 rounded border border-warning/30 shadow-sm transition-all duration-300 hover:shadow-md min-w-0">
                           <div className="text-xs sm:text-lg lg:text-xl font-bold text-warning transition-all duration-200">
                             {formatCurrency(calculatedMetrics?.costPerMeal || liveMetrics.costPerMeal)}
                           </div>
                           <div className="text-xs text-muted-foreground font-medium truncate hidden sm:block">Cost/Meal</div>
                           <div className="text-xs text-muted-foreground font-medium truncate sm:hidden">C</div>
                         </div>
                         <div className="text-center p-1 sm:p-2 lg:p-3 bg-accent/10 rounded border border-accent/30 shadow-sm transition-all duration-300 hover:shadow-md min-w-0">
                           <div className={cn(
                             "text-xs sm:text-lg lg:text-xl font-bold transition-all duration-200",
                             (((calculatedMetrics?.revenue || liveMetrics.revenue) - (calculatedMetrics?.expenses || liveMetrics.expenses)) / (calculatedMetrics?.revenue || liveMetrics.revenue)) * 100 > 0
                               ? "text-success"
                               : "text-danger"
                           )}>
                             {formatPercentage((((calculatedMetrics?.revenue || liveMetrics.revenue) - (calculatedMetrics?.expenses || liveMetrics.expenses)) / (calculatedMetrics?.revenue || liveMetrics.revenue)) * 100)}
                           </div>
                           <div className="text-xs text-muted-foreground font-medium truncate hidden sm:block">Margin</div>
                           <div className="text-xs text-muted-foreground font-medium truncate sm:hidden">Mg</div>
                         </div>
                         
                         {/* Change Metrics - All with identical styling */}
                         <div className="text-center p-1 sm:p-2 lg:p-3 bg-muted/40 rounded border border-border shadow-sm transition-all duration-300 hover:shadow-md min-w-0">
                           <div className={cn("text-xl font-bold transition-all duration-200", 
                             (calculatedMetrics?.revenueChange || 0) > 0 ? "text-success" : "text-danger"
                           )}>
                             {(calculatedMetrics?.revenueChange || 0) > 0 ? '+' : ''}{(calculatedMetrics?.revenueChange || 0).toFixed(1)}%
                           </div>
                           <div className="text-xs text-muted-foreground font-medium truncate hidden sm:block">Revenue Δ</div>
                           <div className="text-xs text-muted-foreground font-medium truncate sm:hidden">R</div>
                         </div>
                         <div className="text-center p-1 sm:p-2 lg:p-3 bg-muted/40 rounded border border-border shadow-sm transition-all duration-300 hover:shadow-md min-w-0">
                           <div className={cn("text-xl font-bold transition-all duration-200",
                             Math.abs(calculatedMetrics?.demandChange || 0) < 5 ? "text-success" : "text-warning"
                           )}>
                             {(calculatedMetrics?.demandChange || 0) > 0 ? '+' : ''}{(calculatedMetrics?.demandChange || 0).toFixed(1)}%
                           </div>
                           <div className="text-xs text-muted-foreground font-medium truncate hidden sm:block">Demand Δ</div>
                           <div className="text-xs text-muted-foreground font-medium truncate sm:hidden">D</div>
                         </div>
                         <div className="text-center p-1 sm:p-2 lg:p-3 bg-muted/40 rounded border border-border shadow-sm transition-all duration-300 hover:shadow-md min-w-0">
                           <div className={cn("text-xl font-bold transition-all duration-200",
                             (calculatedMetrics?.costChange || 0) < 0 ? "text-success" : "text-danger"
                           )}>
                             {(calculatedMetrics?.costChange || 0) > 0 ? '+' : ''}{(calculatedMetrics?.costChange || 0).toFixed(1)}%
                           </div>
                           <div className="text-xs text-muted-foreground font-medium truncate hidden sm:block">Cost Δ</div>
                           <div className="text-xs text-muted-foreground font-medium truncate sm:hidden">C</div>
                         </div>
                         <div className="text-center p-1 sm:p-2 lg:p-3 bg-muted/40 rounded border border-border shadow-sm transition-all duration-300 hover:shadow-md min-w-0">
                           <div className={cn("text-xl font-bold transition-all duration-200",
                             (calculatedMetrics?.efficiencyChange || 0) > 0 ? "text-success" : "text-danger"
                           )}>
                             {(calculatedMetrics?.efficiencyChange || 0) > 0 ? '+' : ''}{(calculatedMetrics?.efficiencyChange || 0).toFixed(1)}%
                           </div>
                           <div className="text-xs text-muted-foreground font-medium truncate hidden sm:block">Efficiency Δ</div>
                           <div className="text-xs text-muted-foreground font-medium truncate sm:hidden">E</div>
                         </div>
                         
                         {/* Additional Change Metrics - Same exact styling as above */}
                         {calculatedMetrics?.reserveChange !== undefined && (
                           <div className="text-center p-1 sm:p-2 lg:p-3 bg-muted/40 rounded border border-border shadow-sm transition-all duration-300 hover:shadow-md min-w-0 hidden sm:block">
                             <div className={cn("text-xl font-bold transition-all duration-200",
                               calculatedMetrics?.reserveChange > 0 ? "text-success" : "text-danger"
                             )}>
                               {calculatedMetrics?.reserveChange > 0 ? '+' : ''}{calculatedMetrics?.reserveChange.toFixed(1)}%
                             </div>
                             <div className="text-xs text-muted-foreground font-medium truncate">Reserves Δ</div>
                           </div>
                         )}
                         {calculatedMetrics?.cashChange !== undefined && (
                           <div className="text-center p-1 sm:p-2 lg:p-3 bg-muted/40 rounded border border-border shadow-sm transition-all duration-300 hover:shadow-md min-w-0 hidden sm:block">
                             <div className={cn("text-xl font-bold transition-all duration-200",
                               calculatedMetrics?.cashChange > 0 ? "text-success" : "text-danger"
                             )}>
                               {calculatedMetrics?.cashChange > 0 ? '+' : ''}{calculatedMetrics?.cashChange.toFixed(1)}%
                             </div>
                             <div className="text-xs text-muted-foreground font-medium truncate">Cash Δ</div>
                           </div>
                         )}
                         {calculatedMetrics?.mealsChange !== undefined && (
                           <div className="text-center p-1 sm:p-2 lg:p-3 bg-muted/40 rounded border border-border shadow-sm transition-all duration-300 hover:shadow-md min-w-0 hidden sm:block">
                             <div className={cn("text-xl font-bold transition-all duration-200",
                               calculatedMetrics?.mealsChange > 0 ? "text-success" : "text-danger"
                             )}>
                               {calculatedMetrics?.mealsChange > 0 ? '+' : ''}{calculatedMetrics?.mealsChange.toFixed(1)}%
                             </div>
                             <div className="text-xs text-muted-foreground font-medium truncate">Meals Δ</div>
                           </div>
                         )}
                       </div>
                     </div>
                   </div>

                   {/* Scenario Analysis Controls */}
                   <div className="pt-4">
                <LazyComponentWrapper>
                  <LazyScenarioAnalysis 
                    factors={scenarioFactors}
                    onFactorChange={updateScenario}
                  />
                </LazyComponentWrapper>
              </div>
          </div>
        );
      default:
        return <ProgrammaticAnalysis />;
    }
  };

  const dashboardMetrics = {
    peopleServed: calculatedMetrics?.peopleServed || metrics?.people_served || liveMetrics.peopleServed,
    mealsDelivered: calculatedMetrics?.mealsDelivered || metrics?.meals_delivered || liveMetrics.mealsDelivered,
    costPerMeal: calculatedMetrics?.costPerMeal || metrics?.cost_per_meal || liveMetrics.costPerMeal,
    coverage: metrics?.coverage_governorates || 27
  };


  // Add a real-time update indicator
  const [lastUpdateTime, setLastUpdateTime] = React.useState<Date | null>(null);
  
  React.useEffect(() => {
    const handleMetricsUpdate = (event: CustomEvent) => {
      console.log('📡 Dashboard: Global metrics update event received:', event.detail);
      if (event.detail) {
        setMetrics(event.detail);
        setLastUpdateTime(new Date());
      }
    };

    window.addEventListener('metricsUpdated', handleMetricsUpdate as EventListener);
    return () => {
      window.removeEventListener('metricsUpdated', handleMetricsUpdate as EventListener);
    };
  }, []);

  return (
    <DashboardLayout 
      metrics={dashboardMetrics}
      sidebar={
        <ReportNavigation 
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
        />
      }
    >
      {/* Real-time update indicator */}
      {lastUpdateTime && (
        <div className="fixed top-4 left-4 z-50 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span className="text-sm font-medium">Updated: {lastUpdateTime.toLocaleTimeString()}</span>
        </div>
      )}
      
      {isLoading ? (
        <PageLoadingSkeleton />
      ) : (
        renderCurrentSection()
      )}

      {selectedMetric && (
        <MetricDetailModal 
          isOpen={!!selectedMetric}
          onClose={() => setSelectedMetric(null)}
          metric={selectedMetric}
        />
      )}

      <ScenarioModelModal 
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
      />
    </DashboardLayout>
  );
});

ExecutiveDashboard.displayName = 'ExecutiveDashboard';

export { ExecutiveDashboard };
