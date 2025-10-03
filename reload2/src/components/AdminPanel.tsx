import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Database, Globe, LineChart, RefreshCw, Shield, Save, XCircle, Zap, Brain } from 'lucide-react';
import { dataService, ExecutiveMetrics, User, AuditLog } from '@/lib/data-service';
import { AutomatedRealtimeTest } from './AutomatedRealtimeTest';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/formatters';

export const AdminPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  // Complete form states for ALL dashboard data points
  const [editMetrics, setEditMetrics] = useState<Partial<ExecutiveMetrics>>({});
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
  const [chartData, setChartData] = useState({
    revenueChange: 0,
    demandChange: 0,
    costChange: 0,
    efficiencyChange: 0,
    reserveChange: 0,
    cashChange: 0,
    mealsChange: 0,
  });
  const [globalIndicators, setGlobalIndicators] = useState({
    egyptInflation: 35.7,
    egyptCurrency: 47.5,
    egyptFoodInsecurity: 17.2,
    globalInflation: 6.8,
    globalFoodPrices: 23.4,
    emergingMarketRisk: 72.3,
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    // Set up real-time subscription for metrics changes
    const unsubscribe = dataService.subscribeToExecutiveMetrics((updatedMetrics) => {
      console.log('📡 Real-time update received:', updatedMetrics);
      setMetrics(updatedMetrics);
      setEditMetrics(updatedMetrics);
      setLastUpdated(new Date());
      
      if (updatedMetrics.scenario_factors) {
        setScenarioFactors(prev => ({ ...prev, ...updatedMetrics.scenario_factors }));
      }
      
      if (updatedMetrics.revenueChange !== undefined) {
        setChartData(prev => ({ ...prev, revenueChange: updatedMetrics.revenueChange }));
      }
      if (updatedMetrics.demandChange !== undefined) {
        setChartData(prev => ({ ...prev, demandChange: updatedMetrics.demandChange }));
      }
      if (updatedMetrics.costChange !== undefined) {
        setChartData(prev => ({ ...prev, costChange: updatedMetrics.costChange }));
      }
      if (updatedMetrics.efficiencyChange !== undefined) {
        setChartData(prev => ({ ...prev, efficiencyChange: updatedMetrics.efficiencyChange }));
      }
      if (updatedMetrics.reserveChange !== undefined) {
        setChartData(prev => ({ ...prev, reserveChange: updatedMetrics.reserveChange }));
      }
      if (updatedMetrics.cashChange !== undefined) {
        setChartData(prev => ({ ...prev, cashChange: updatedMetrics.cashChange }));
      }
      if (updatedMetrics.mealsChange !== undefined) {
        setChartData(prev => ({ ...prev, mealsChange: updatedMetrics.mealsChange }));
      }
      
      if (updatedMetrics.globalIndicators) {
        setGlobalIndicators(prev => ({ ...prev, ...updatedMetrics.globalIndicators }));
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Check connection with retry logic
      let isConnected = false;
      try {
        isConnected = await dataService.checkConnection();
      } catch (connError) {
        console.warn('Connection check failed:', connError);
      }
      
      // If connection check fails, try to get metrics anyway
      let metricsData = null;
      try {
        metricsData = await dataService.getExecutiveMetrics();
        // If we get metrics, we're connected
        isConnected = true;
      } catch (metricsError) {
        console.warn('Failed to get metrics:', metricsError);
      }
      
      setConnectionStatus(isConnected);

      // Load other data only if connected
      let usersData = [];
      let auditData = [];
      
      if (isConnected) {
        try {
          [usersData, auditData] = await Promise.all([
            dataService.getUsers().catch(() => []),
            dataService.getAuditLogs(20).catch(() => [])
          ]);
        } catch (otherError) {
          console.warn('Failed to load other data:', otherError);
        }
      }

      // Always set metrics, even if empty
      setMetrics(metricsData);
      
      // Set edit metrics with default values if empty
      const defaultMetrics = {
        people_served: metricsData?.people_served || 4960000,
        meals_delivered: metricsData?.meals_delivered || 367490721,
        cost_per_meal: metricsData?.cost_per_meal || 6.36,
        program_efficiency: metricsData?.program_efficiency || 83,
        revenue: metricsData?.revenue || 2200000000,
        expenses: metricsData?.expenses || 2316000000,
        reserves: metricsData?.reserves || 731200000,
        cash_position: metricsData?.cash_position || 459800000,
        coverage_governorates: metricsData?.coverage_governorates || 27
      };
      
      setEditMetrics(defaultMetrics);
      setUsers(usersData);
      setAuditLogs(auditData);

      // Load scenario factors and chart data from metrics or defaults
      if (metricsData?.scenario_factors) {
        setScenarioFactors(prev => ({ ...prev, ...metricsData.scenario_factors }));
      } else {
        // Set default scenario factors
        setScenarioFactors({
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
      }

      // Set default chart data
      setChartData({
        revenueChange: metricsData?.revenueChange || 0,
        demandChange: metricsData?.demandChange || 0,
        costChange: metricsData?.costChange || 0,
        efficiencyChange: metricsData?.efficiencyChange || 0,
        reserveChange: metricsData?.reserveChange || 0,
        cashChange: metricsData?.cashChange || 0,
        mealsChange: metricsData?.mealsChange || 0,
      });

      // Set default global indicators
      setGlobalIndicators({
        egyptInflation: metricsData?.globalIndicators?.egyptInflation || 35.7,
        egyptCurrency: metricsData?.globalIndicators?.egyptCurrency || 47.5,
        egyptFoodInsecurity: metricsData?.globalIndicators?.egyptFoodInsecurity || 17.2,
        globalInflation: metricsData?.globalIndicators?.globalInflation || 6.8,
        globalFoodPrices: metricsData?.globalIndicators?.globalFoodPrices || 23.4,
        emergingMarketRisk: metricsData?.globalIndicators?.emergingMarketRisk || 72.3,
      });

      setMessage({ 
        text: isConnected ? 
          '✅ Admin panel connected and loaded with current data!' : 
          '⚠️ Admin panel loaded with demo data (database disconnected)', 
        type: isConnected ? 'success' : 'warning' 
      });
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error loading admin data:', error);
      setMessage({ text: '⚠️ Loaded with demo data - connection issues', type: 'warning' });
      
      // Set default values even on error
      setEditMetrics({
        people_served: 4960000,
        meals_delivered: 367490721,
        cost_per_meal: 6.36,
        program_efficiency: 83,
        revenue: 2200000000,
        expenses: 2316000000,
        reserves: 731200000,
        cash_position: 459800000,
        coverage_governorates: 27
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSaveMetrics = async (): Promise<boolean> => {
    if (!editMetrics) return false;

    try {
      setSaving(true);
      setMessage({ text: 'Saving core metrics...', type: 'success' });

      const updateData = {
        ...editMetrics,
        scenario_factors: scenarioFactors,
        ...chartData,
        globalIndicators,
      };

      const updated = await dataService.updateExecutiveMetrics(updateData);

      if (updated) {
        setMetrics(updated);
        setEditMetrics(updated);
        setLastUpdated(new Date());
        setMessage({ text: 'Core metrics saved! Dashboard will update in real-time within seconds.', type: 'success' });
        return true;
      }

      setMessage({ text: 'Metrics saved locally - waiting for realtime confirmation.', type: 'warning' });
      return false;
    } catch (error) {
      console.error('Error saving metrics:', error);
      setMessage({ text: 'Failed to save metrics - please try again', type: 'error' });
      return false;
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleSaveScenarioFactors = async (): Promise<boolean> => {
    try {
      setSaving(true);
      setMessage({ text: 'Saving scenario factors...', type: 'success' });

      if (!metrics) {
        return false;
      }

      const updateData = {
        ...metrics,
        scenario_factors: scenarioFactors,
      };

      const updated = await dataService.updateExecutiveMetrics(updateData);

      if (updated) {
        setMetrics(updated);
        setLastUpdated(new Date());
        setMessage({ text: 'Scenario factors saved! Dashboard charts updating in real-time.', type: 'success' });
        return true;
      }

      setMessage({ text: 'Scenario factors saved - awaiting realtime confirmation.', type: 'warning' });
      return false;
    } catch (error) {
      console.error('Error saving scenario factors:', error);
      setMessage({ text: 'Failed to save scenario factors', type: 'error' });
      return false;
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleSaveChartData = async (): Promise<boolean> => {
    try {
      setSaving(true);
      setMessage({ text: 'Saving chart data...', type: 'success' });

      if (!metrics) {
        return false;
      }

      const updateData = {
        ...metrics,
        ...chartData,
      };

      const updated = await dataService.updateExecutiveMetrics(updateData);

      if (updated) {
        setMetrics(updated);
        setLastUpdated(new Date());
        setMessage({ text: 'Chart data saved! Dashboard charts updating in real-time.', type: 'success' });
        return true;
      }

      setMessage({ text: 'Chart data saved - awaiting realtime confirmation.', type: 'warning' });
      return false;
    } catch (error) {
      console.error('Error saving chart data:', error);
      setMessage({ text: 'Failed to save chart data', type: 'error' });
      return false;
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleSaveGlobalIndicators = async (): Promise<boolean> => {
    try {
      setSaving(true);
      setMessage({ text: 'Saving global indicators...', type: 'success' });

      if (!metrics) {
        return false;
      }

      const updateData = {
        ...metrics,
        globalIndicators,
      };

      const updated = await dataService.updateExecutiveMetrics(updateData);

      if (updated) {
        setMetrics(updated);
        setLastUpdated(new Date());
        setMessage({ text: 'Global indicators saved! Dashboard updating in real-time.', type: 'success' });
        return true;
      }

      setMessage({ text: 'Global indicators saved - awaiting realtime confirmation.', type: 'warning' });
      return false;
    } catch (error) {
      console.error('Error saving global indicators:', error);
      setMessage({ text: 'Failed to save global indicators', type: 'error' });
      return false;
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const renderCoreMetricsForm = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="people_served" className="text-sm font-medium">People Served</Label>
        <Input
          id="people_served"
          type="number"
          className="text-lg"
          value={editMetrics.people_served || ''}
          onChange={(e) => setEditMetrics(prev => ({
            ...prev,
            people_served: Number(e.target.value)
          }))}
        />
        <p className="text-xs text-muted-foreground">Updates the Lives Impacted KPI.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="meals_delivered" className="text-sm font-medium">Meals Delivered</Label>
        <Input
          id="meals_delivered"
          type="number"
          className="text-lg"
          value={editMetrics.meals_delivered || ''}
          onChange={(e) => setEditMetrics(prev => ({
            ...prev,
            meals_delivered: Number(e.target.value)
          }))}
        />
        <p className="text-xs text-muted-foreground">Feeds the Meals Delivered metric.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cost_per_meal" className="text-sm font-medium">Cost Per Meal (EGP)</Label>
        <Input
          id="cost_per_meal"
          type="number"
          step="0.01"
          className="text-lg"
          value={editMetrics.cost_per_meal || ''}
          onChange={(e) => setEditMetrics(prev => ({
            ...prev,
            cost_per_meal: Number(e.target.value)
          }))}
        />
        <p className="text-xs text-muted-foreground">Impacts unit economics across charts.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="program_efficiency" className="text-sm font-medium">Program Efficiency (%)</Label>
        <Input
          id="program_efficiency"
          type="number"
          step="0.1"
          className="text-lg"
          value={editMetrics.program_efficiency || ''}
          onChange={(e) => setEditMetrics(prev => ({
            ...prev,
            program_efficiency: Number(e.target.value)
          }))}
        />
        <p className="text-xs text-muted-foreground">Shown in efficiency gauges.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="revenue" className="text-sm font-medium">Revenue (EGP)</Label>
        <Input
          id="revenue"
          type="number"
          className="text-lg"
          value={editMetrics.revenue || ''}
          onChange={(e) => setEditMetrics(prev => ({
            ...prev,
            revenue: Number(e.target.value)
          }))}
        />
        <p className="text-xs text-muted-foreground">Feeds financial health tiles.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="expenses" className="text-sm font-medium">Expenses (EGP)</Label>
        <Input
          id="expenses"
          type="number"
          className="text-lg"
          value={editMetrics.expenses || ''}
          onChange={(e) => setEditMetrics(prev => ({
            ...prev,
            expenses: Number(e.target.value)
          }))}
        />
        <p className="text-xs text-muted-foreground">Highlights burn rate trends.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reserves" className="text-sm font-medium">Reserves (EGP)</Label>
        <Input
          id="reserves"
          type="number"
          className="text-lg"
          value={editMetrics.reserves || ''}
          onChange={(e) => setEditMetrics(prev => ({
            ...prev,
            reserves: Number(e.target.value)
          }))}
        />
        <p className="text-xs text-muted-foreground">Drives liquidity indicators.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cash_position" className="text-sm font-medium">Cash Position (EGP)</Label>
        <Input
          id="cash_position"
          type="number"
          className="text-lg"
          value={editMetrics.cash_position || ''}
          onChange={(e) => setEditMetrics(prev => ({
            ...prev,
            cash_position: Number(e.target.value)
          }))}
        />
        <p className="text-xs text-muted-foreground">Updates liquidity callouts.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="coverage_governorates" className="text-sm font-medium">Coverage (Governorates)</Label>
        <Input
          id="coverage_governorates"
          type="number"
          className="text-lg"
          value={editMetrics.coverage_governorates || ''}
          onChange={(e) => setEditMetrics(prev => ({
            ...prev,
            coverage_governorates: Number(e.target.value)
          }))}
        />
        <p className="text-xs text-muted-foreground">Impacts geographic footprint visuals.</p>
      </div>
    </div>
  );

  const renderScenarioForm = () => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Object.entries(scenarioFactors).map(([key, value]) => (
        <div key={key} className="space-y-2 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm">
            <Label className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
            <span className="text-sm font-semibold">{value}</span>
          </div>
          <Slider
            value={[value]}
            step={1}
            min={-200}
            max={200}
            onValueChange={(val) => setScenarioFactors(prev => ({ ...prev, [key]: val[0] }))}
          />
        </div>
      ))}
    </div>
  );

  const renderChartForm = () => (
    <div className="grid gap-4 md:grid-cols-2">
      {Object.entries(chartData).map(([key, value]) => (
        <div key={key} className="space-y-2 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between text-sm">
            <Label className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
            <span className="text-sm font-semibold">{value}%</span>
          </div>
          <Slider
            value={[value]}
            step={0.5}
            min={-50}
            max={50}
            onValueChange={(val) => setChartData(prev => ({ ...prev, [key]: Number(val[0]) }))}
          />
        </div>
      ))}
    </div>
  );

  const renderGlobalForm = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="egyptInflation" className="text-sm font-medium">Egypt Inflation (%)</Label>
        <Input
          id="egyptInflation"
          type="number"
          value={globalIndicators.egyptInflation}
          onChange={(e) => setGlobalIndicators(prev => ({ ...prev, egyptInflation: Number(e.target.value) }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="egyptCurrency" className="text-sm font-medium">EGP Exchange Rate</Label>
        <Input
          id="egyptCurrency"
          type="number"
          value={globalIndicators.egyptCurrency}
          onChange={(e) => setGlobalIndicators(prev => ({ ...prev, egyptCurrency: Number(e.target.value) }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="egyptFoodInsecurity" className="text-sm font-medium">Food Insecurity (%)</Label>
        <Input
          id="egyptFoodInsecurity"
          type="number"
          value={globalIndicators.egyptFoodInsecurity}
          onChange={(e) => setGlobalIndicators(prev => ({ ...prev, egyptFoodInsecurity: Number(e.target.value) }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="globalInflation" className="text-sm font-medium">Global Inflation (%)</Label>
        <Input
          id="globalInflation"
          type="number"
          value={globalIndicators.globalInflation}
          onChange={(e) => setGlobalIndicators(prev => ({ ...prev, globalInflation: Number(e.target.value) }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="globalFoodPrices" className="text-sm font-medium">Global Food Prices (Index)</Label>
        <Input
          id="globalFoodPrices"
          type="number"
          value={globalIndicators.globalFoodPrices}
          onChange={(e) => setGlobalIndicators(prev => ({ ...prev, globalFoodPrices: Number(e.target.value) }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="emergingMarketRisk" className="text-sm font-medium">Emerging Market Risk</Label>
        <Input
          id="emergingMarketRisk"
          type="number"
          value={globalIndicators.emergingMarketRisk}
          onChange={(e) => setGlobalIndicators(prev => ({ ...prev, emergingMarketRisk: Number(e.target.value) }))}
        />
      </div>
    </div>
  );
  const scenarioSummaryKeys: (keyof typeof scenarioFactors)[] = [
    'economicGrowth',
    'inflationRate',
    'exchangeRateEGP',
    'operationalEfficiency',
    'donorSentiment',
    'regionalShock',
  ];

  const chartSummaryKeys: (keyof typeof chartData)[] = [
    'revenueChange',
    'demandChange',
    'costChange',
    'efficiencyChange',
    'reserveChange',
    'cashChange',
  ];

  const globalSummaryKeys: (keyof typeof globalIndicators)[] = [
    'egyptInflation',
    'egyptCurrency',
    'egyptFoodInsecurity',
    'globalInflation',
    'globalFoodPrices',
    'emergingMarketRisk',
  ];

  const scenarioLabels: Record<keyof typeof scenarioFactors, string> = {
    economicGrowth: 'Economic Growth',
    inflationRate: 'Inflation Rate',
    donorSentiment: 'Donor Sentiment',
    operationalEfficiency: 'Operational Efficiency',
    foodPrices: 'Food Prices Index',
    unemploymentRate: 'Unemployment Rate',
    corporateCSR: 'Corporate CSR',
    governmentSupport: 'Government Support',
    exchangeRateEGP: 'Exchange Rate (EGP)',
    logisticsCostIndex: 'Logistics Cost Index',
    regionalShock: 'Regional Shock',
  };

  const chartLabels: Record<keyof typeof chartData, string> = {
    revenueChange: 'Revenue Change',
    demandChange: 'Demand Change',
    costChange: 'Cost Change',
    efficiencyChange: 'Efficiency Change',
    reserveChange: 'Reserves Change',
    cashChange: 'Cash Change',
    mealsChange: 'Meals Change',
  };

  const globalLabels: Record<keyof typeof globalIndicators, string> = {
    egyptInflation: 'Egypt Inflation',
    egyptCurrency: 'Currency (EGP/USD)',
    egyptFoodInsecurity: 'Food Insecurity',
    globalInflation: 'Global Inflation',
    globalFoodPrices: 'Global Food Prices',
    emergingMarketRisk: 'EM Risk Index',
  };

  const formatScenarioValue = (key: keyof typeof scenarioFactors, value: number) => {
    if (['economicGrowth', 'inflationRate', 'donorSentiment', 'operationalEfficiency', 'unemploymentRate', 'regionalShock'].includes(key)) {
      return `${value}%`;
    }
    if (key === 'exchangeRateEGP') {
      return value.toFixed(2);
    }
    return value.toString();
  };

  const formatChartValue = (value: number) => `${value.toFixed(1)}%`; 

  const formatGlobalValue = (key: keyof typeof globalIndicators, value: number) => {
    if (['egyptInflation', 'egyptFoodInsecurity', 'globalInflation'].includes(key)) {
      return `${value.toFixed(1)}%`;
    }
    if (key === 'egyptCurrency') {
      return value.toFixed(2);
    }
    if (key === 'globalFoodPrices') {
      return value.toFixed(1);
    }
    return value.toString();
  };

  const runAutomatedTest = async () => {
    try {
      setMessage({ text: '🧪 Running automated test: Updating figures...', type: 'success' });
      
      // Test with random values
      const testData = {
        people_served: Math.floor(Math.random() * 10000000) + 4000000,
        meals_delivered: Math.floor(Math.random() * 100000000) + 300000000,
        cost_per_meal: Math.random() * 10 + 5,
        program_efficiency: Math.random() * 20 + 70,
        revenue: Math.floor(Math.random() * 1000000000) + 2000000000,
        expenses: Math.floor(Math.random() * 1000000000) + 2000000000,
        reserves: Math.floor(Math.random() * 1000000000) + 500000000,
        cash_position: Math.floor(Math.random() * 1000000000) + 300000000,
        coverage_governorates: Math.floor(Math.random() * 5) + 25,
        scenario_factors: {
          economicGrowth: Math.random() * 10 - 5,
          inflationRate: Math.random() * 20 + 20,
          donorSentiment: Math.random() * 100 - 50,
          operationalEfficiency: Math.random() * 50 + 75,
          foodPrices: Math.random() * 50 + 100,
          unemploymentRate: Math.random() * 10 + 10,
          corporateCSR: Math.random() * 100 - 25,
          governmentSupport: Math.random() * 100 - 25,
          exchangeRateEGP: Math.random() * 20 + 35,
          logisticsCostIndex: Math.random() * 50 + 100,
          regionalShock: Math.random() * 100 - 50,
        },
        revenueChange: Math.random() * 20 - 10,
        demandChange: Math.random() * 20 - 10,
        costChange: Math.random() * 20 - 10,
        efficiencyChange: Math.random() * 20 - 10,
        reserveChange: Math.random() * 20 - 10,
        cashChange: Math.random() * 20 - 10,
        mealsChange: Math.random() * 20 - 10,
        globalIndicators: {
          egyptInflation: Math.random() * 20 + 25,
          egyptCurrency: Math.random() * 20 + 40,
          egyptFoodInsecurity: Math.random() * 10 + 12,
          globalInflation: Math.random() * 5 + 4,
          globalFoodPrices: Math.random() * 20 + 15,
          emergingMarketRisk: Math.random() * 30 + 60,
        }
      };

      const updated = await dataService.updateExecutiveMetrics(testData);
      if (updated) {
        setMetrics(updated);
        setEditMetrics(updated);
        setScenarioFactors(testData.scenario_factors);
        setChartData({
          revenueChange: testData.revenueChange,
          demandChange: testData.demandChange,
          costChange: testData.costChange,
          efficiencyChange: testData.efficiencyChange,
          reserveChange: testData.reserveChange,
          cashChange: testData.cashChange,
          mealsChange: testData.mealsChange,
        });
        setGlobalIndicators(testData.globalIndicators);
        setLastUpdated(new Date());
        setMessage({ text: '🎉 Automated test complete! Check dashboard for real-time updates!', type: 'success' });
      }
    } catch (error) {
      console.error('Error running automated test:', error);
      setMessage({ text: 'Automated test failed', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading advanced admin panel...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Fixed Header */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Advanced Admin Control Center</h1>
                <p className="text-sm text-muted-foreground">
                  Complete dashboard control with real-time Supabase synchronization
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={connectionStatus ? "default" : "secondary"}>
              {connectionStatus ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
              Database {connectionStatus ? 'Connected' : 'Using Demo Data'}
            </Badge>
            <div className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button variant="outline" size="sm" onClick={loadAdminData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="default" size="sm" onClick={runAutomatedTest}>
              <Zap className="w-4 h-4 mr-2" />
              Auto Test
            </Button>
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={'flex-shrink-0 p-3 border-b ' + (
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
          message.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
          'bg-red-50 border-red-200 text-red-800'
        )}>
          <div className="container mx-auto text-sm font-medium">{String(message.text)}</div>
        </div>
      )}

﻿      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto flex h-full flex-col gap-6 p-6">
          <div className="grid flex-1 gap-6 md:grid-cols-2 xl:grid-cols-3 auto-rows-[minmax(0,1fr)]">
            <Card className="flex flex-col border-l-4 border-l-primary shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4 p-5">
                <div>
                  <CardTitle className="text-xl">Core Metrics</CardTitle>
                  <CardDescription>Live impact totals powering the executive dashboard.</CardDescription>
                </div>
                <Dialog open={activeDialog === "metrics"} onOpenChange={(open) => setActiveDialog(open ? "metrics" : null)}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Database className="h-4 w-4" />
                      Adjust
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl space-y-6">
                    <DialogHeader>
                      <DialogTitle>Adjust Core Metrics</DialogTitle>
                      <DialogDescription>
                        Changes stream to Supabase instantly and broadcast to every dashboard widget.
                      </DialogDescription>
                    </DialogHeader>
                    {renderCoreMetricsForm()}
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                      </DialogClose>
                      <Button disabled={saving} onClick={async () => { const success = await handleSaveMetrics(); if (success) setActiveDialog(null); }}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Metrics
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="grid flex-1 grid-cols-2 gap-4 p-5">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">People Served</p>
                  <p className="text-2xl font-semibold">{formatNumber(editMetrics.people_served ?? 0)}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Meals Delivered</p>
                  <p className="text-2xl font-semibold">{formatNumber(editMetrics.meals_delivered ?? 0)}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Cost Per Meal</p>
                  <p className="text-2xl font-semibold">{formatCurrency(editMetrics.cost_per_meal ?? 0)}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Program Efficiency</p>
                  <p className="text-2xl font-semibold">{formatPercentage(editMetrics.program_efficiency ?? 0, 1)}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-semibold">{formatCurrency(editMetrics.revenue ?? 0)}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Expenses</p>
                  <p className="text-2xl font-semibold">{formatCurrency(editMetrics.expenses ?? 0)}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Reserves</p>
                  <p className="text-2xl font-semibold">{formatCurrency(editMetrics.reserves ?? 0)}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Cash Position</p>
                  <p className="text-2xl font-semibold">{formatCurrency(editMetrics.cash_position ?? 0)}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Coverage</p>
                  <p className="text-2xl font-semibold">{formatNumber(editMetrics.coverage_governorates ?? 0)} / 27</p>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t bg-muted/20 px-5 py-3 text-xs text-muted-foreground">
                <span>Last synced {lastUpdated.toLocaleTimeString()}</span>
                <Badge variant={connectionStatus ? "outline" : "secondary"} className="flex items-center gap-1">
                  {connectionStatus ? <CheckCircle className="h-3 w-3 text-primary" /> : <XCircle className="h-3 w-3 text-muted-foreground" />}
                  {connectionStatus ? "Realtime" : "Demo"}
                </Badge>
              </CardFooter>
            </Card>
            <Card className="flex flex-col border-l-4 border-l-blue-500 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4 p-5">
                <div>
                  <CardTitle className="text-xl">Scenario Modeling</CardTitle>
                  <CardDescription>Stress inputs for forecasting and scenario analysis.</CardDescription>
                </div>
                <Dialog open={activeDialog === "scenario"} onOpenChange={(open) => setActiveDialog(open ? "scenario" : null)}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Brain className="h-4 w-4" />
                      Adjust
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl space-y-6">
                    <DialogHeader>
                      <DialogTitle>Adjust Scenario Factors</DialogTitle>
                      <DialogDescription>Tune the macro inputs that drive forecasting modules.</DialogDescription>
                    </DialogHeader>
                    {renderScenarioForm()}
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                      </DialogClose>
                      <Button disabled={saving} onClick={async () => { const success = await handleSaveScenarioFactors(); if (success) setActiveDialog(null); }}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Scenario Factors
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="grid flex-1 grid-cols-2 gap-4 p-5">
                {scenarioSummaryKeys.map((key) => (
                  <div key={key} className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{scenarioLabels[key]}</p>
                    <p className="text-2xl font-semibold">{formatScenarioValue(key, scenarioFactors[key])}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="flex flex-col border-l-4 border-l-amber-500 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4 p-5">
                <div>
                  <CardTitle className="text-xl">Chart Drivers</CardTitle>
                  <CardDescription>Underlying percentages for analytical visuals.</CardDescription>
                </div>
                <Dialog open={activeDialog === "charts"} onOpenChange={(open) => setActiveDialog(open ? "charts" : null)}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2">
                      <LineChart className="h-4 w-4" />
                      Adjust
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl space-y-6">
                    <DialogHeader>
                      <DialogTitle>Adjust Chart Drivers</DialogTitle>
                      <DialogDescription>Update the percentage deltas surfaced in analytical cards.</DialogDescription>
                    </DialogHeader>
                    {renderChartForm()}
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                      </DialogClose>
                      <Button disabled={saving} onClick={async () => { const success = await handleSaveChartData(); if (success) setActiveDialog(null); }}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Chart Drivers
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="grid flex-1 grid-cols-2 gap-4 p-5">
                {chartSummaryKeys.map((key) => (
                  <div key={key} className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{chartLabels[key]}</p>
                    <p className="text-2xl font-semibold">{formatChartValue(chartData[key])}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="flex flex-col border-l-4 border-l-emerald-500 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4 p-5">
                <div>
                  <CardTitle className="text-xl">Global Indicators</CardTitle>
                  <CardDescription>External signals feeding the global signals tiles.</CardDescription>
                </div>
                <Dialog open={activeDialog === "global"} onOpenChange={(open) => setActiveDialog(open ? "global" : null)}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Globe className="h-4 w-4" />
                      Adjust
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl space-y-6">
                    <DialogHeader>
                      <DialogTitle>Adjust Global Indicators</DialogTitle>
                      <DialogDescription>Sync the macroeconomic data points used across dashboards.</DialogDescription>
                    </DialogHeader>
                    {renderGlobalForm()}
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                      </DialogClose>
                      <Button disabled={saving} onClick={async () => { const success = await handleSaveGlobalIndicators(); if (success) setActiveDialog(null); }}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Indicators
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="grid flex-1 grid-cols-2 gap-4 p-5">
                {globalSummaryKeys.map((key) => (
                  <div key={key} className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{globalLabels[key]}</p>
                    <p className="text-2xl font-semibold">{formatGlobalValue(key, globalIndicators[key])}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="flex flex-col border-l-4 border-l-sky-500 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4 p-5">
                <div>
                  <CardTitle className="text-xl">System Health</CardTitle>
                  <CardDescription>Realtime connectivity and dataset integrity.</CardDescription>
                </div>
                <Button size="sm" variant="outline" className="gap-2" onClick={loadAdminData}>
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent className="grid flex-1 grid-cols-1 gap-4 p-5">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Supabase Connection</p>
                  <p className={`text-xl font-semibold ${connectionStatus ? 'text-emerald-600' : 'text-destructive'}`}>{connectionStatus ? 'Connected' : 'Offline'}</p>
                  <p className="text-xs text-muted-foreground">Service role authenticated for privileged mutations.</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Last Update</p>
                  <p className="text-xl font-semibold">{lastUpdated.toLocaleTimeString()}</p>
                  <p className="text-xs text-muted-foreground">Realtime channel delivered most recent change.</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Active Admins</p>
                  <p className="text-xl font-semibold">{users.filter((user) => user.role === 'admin').length}</p>
                  <p className="text-xs text-muted-foreground">Based on Supabase auth metadata.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="flex flex-col border-l-4 border-l-indigo-500 shadow-sm xl:col-span-2">
              <CardHeader className="flex flex-row items-start justify-between gap-4 p-5">
                <div>
                  <CardTitle className="text-xl">User Access & Audit</CardTitle>
                  <CardDescription>Latest administrator actions and role distribution.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid flex-1 gap-4 p-5 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Role Distribution</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {['admin', 'editor', 'viewer'].map((role) => {
                        const count = users.filter((user) => user.role === role).length;
                        return (
                          <Badge key={role} variant={role === 'admin' ? 'destructive' : role === 'editor' ? 'default' : 'secondary'}>
                            {role}: {count}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Last Sync</p>
                    <p className="text-xl font-semibold">{lastUpdated.toLocaleTimeString()}</p>
                    <p className="text-xs text-muted-foreground">Audit entries pulled from Supabase audit_logs.</p>
                  </div>
                </div>
                <ScrollArea className="max-h-64 rounded-lg border bg-muted/10">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Table</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.slice(0, 8).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">{new Date(log.created_at).toLocaleTimeString()}</TableCell>
                          <TableCell>{log.user_id}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                log.action === 'create'
                                  ? 'default'
                                  : log.action === 'update'
                                    ? 'secondary'
                                    : log.action === 'delete'
                                      ? 'destructive'
                                      : 'outline'
                              }
                            >
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">{log.table_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
            <Card className="flex flex-col border-l-4 border-l-amber-500 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4 p-5">
                <div>
                  <CardTitle className="text-xl">Automation & QA</CardTitle>
                  <CardDescription>Launch the scripted realtime verification flow.</CardDescription>
                </div>
                <Dialog open={activeDialog === "automation"} onOpenChange={(open) => setActiveDialog(open ? "automation" : null)}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="default" className="gap-2">
                      <Zap className="h-4 w-4" />
                      Launch Tests
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl space-y-4">
                    <DialogHeader>
                      <DialogTitle>Automated Realtime Suite</DialogTitle>
                      <DialogDescription>Runs scripted scenarios to guarantee Supabase → UI synchronicity.</DialogDescription>
                    </DialogHeader>
                    <AutomatedRealtimeTest />
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="default">Close</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4 p-5">
                <p className="text-sm text-muted-foreground">
                  Execute the end-to-end Playwright workflow that mutates Supabase data and validates realtime updates across the admin and public dashboards.
                </p>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Last Suite Execution</p>
                  <p className="text-xl font-semibold">{lastUpdated.toLocaleTimeString()}</p>
                  <p className="text-xs text-muted-foreground">Use the launcher above to run the verification script with fresh data.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminPanel;
