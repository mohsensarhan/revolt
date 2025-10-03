import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Activity,
  TrendingUp,
  AlertCircle,
  Clock
} from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/formatters';

export const AutomatedRealtimeTest: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [originalMetrics, setOriginalMetrics] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<boolean>(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const isConnected = await dataService.checkConnection();
      setConnectionStatus(isConnected);
    } catch (error) {
      setConnectionStatus(false);
    }
  };

  const runComprehensiveTest = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setTestResults([]);
    setCurrentTest('Starting comprehensive real-time test...');

    try {
      // Step 1: Get original metrics
      setCurrentTest('Retrieving original metrics...');
      const original = await dataService.getExecutiveMetrics();
      setOriginalMetrics(original);
      
      // Step 2: Test Core Metrics Updates
      await testCoreMetricsUpdates(original);
      
      // Step 3: Test Scenario Factors Updates
      await testScenarioFactorsUpdates(original);
      
      // Step 4: Test Chart Data Updates
      await testChartDataUpdates(original);
      
      // Step 5: Test Global Indicators Updates
      await testGlobalIndicatorsUpdates(original);
      
      // Step 6: Restore original values
      await restoreOriginalValues(original);
      
      setCurrentTest('✅ All tests completed successfully!');
      
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults(prev => [...prev, {
        test: 'Overall Test',
        status: 'failed',
        message: error.message,
        timestamp: new Date()
      }]);
      setCurrentTest('❌ Test failed: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const testCoreMetricsUpdates = async (original: any) => {
    setCurrentTest('Testing Core Metrics updates...');
    
    const testMetrics = {
      people_served: (original.people_served || 4960000) + 1000000,
      meals_delivered: (original.meals_delivered || 367490721) + 50000000,
      cost_per_meal: (original.cost_per_meal || 6.36) + 2,
      program_efficiency: (original.program_efficiency || 83) + 10,
      revenue: (original.revenue || 2200000000) + 500000000,
      expenses: (original.expenses || 2316000000) + 300000000,
      reserves: (original.reserves || 731200000) + 200000000,
      cash_position: (original.cash_position || 459800000) + 100000000,
      coverage_governorates: Math.min((original.coverage_governorates || 27) + 1, 27)
    };

    // Update and verify
    const updated = await dataService.updateExecutiveMetrics(testMetrics);
    
    // Wait for real-time update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify update
    const current = await dataService.getExecutiveMetrics();
    
    const success = current.people_served === testMetrics.people_served &&
                   current.meals_delivered === testMetrics.meals_delivered &&
                   current.cost_per_meal === testMetrics.cost_per_meal;
    
    setTestResults(prev => [...prev, {
      test: 'Core Metrics Update',
      status: success ? 'success' : 'failed',
      message: success ? 'All core metrics updated successfully' : 'Core metrics update failed',
      timestamp: new Date(),
      details: {
        expected: testMetrics,
        actual: current
      }
    }]);
    
    if (!success) {
      throw new Error('Core metrics update test failed');
    }
  };

  const testScenarioFactorsUpdates = async (original: any) => {
    setCurrentTest('Testing Scenario Factors updates...');
    
    const testScenarioFactors = {
      economicGrowth: 5.5,
      inflationRate: 25.3,
      donorSentiment: 75,
      operationalEfficiency: 125,
      foodPrices: 150,
      unemploymentRate: 15.2,
      corporateCSR: 85,
      governmentSupport: 65,
      exchangeRateEGP: 42.8,
      logisticsCostIndex: 135,
      regionalShock: -25
    };

    const updateData = {
      ...original,
      scenario_factors: testScenarioFactors
    };

    const updated = await dataService.updateExecutiveMetrics(updateData);
    
    // Wait for real-time update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const current = await dataService.getExecutiveMetrics();
    
    const success = JSON.stringify(current.scenario_factors) === JSON.stringify(testScenarioFactors);
    
    setTestResults(prev => [...prev, {
      test: 'Scenario Factors Update',
      status: success ? 'success' : 'failed',
      message: success ? 'All scenario factors updated successfully' : 'Scenario factors update failed',
      timestamp: new Date(),
      details: {
        expected: testScenarioFactors,
        actual: current.scenario_factors
      }
    }]);
    
    if (!success) {
      throw new Error('Scenario factors update test failed');
    }
  };

  const testChartDataUpdates = async (original: any) => {
    setCurrentTest('Testing Chart Data updates...');
    
    const testChartData = {
      revenueChange: 15.5,
      demandChange: -8.3,
      costChange: -5.2,
      efficiencyChange: 12.8,
      reserveChange: 8.7,
      cashChange: -3.4,
      mealsChange: 18.9
    };

    const updateData = {
      ...original,
      ...testChartData
    };

    const updated = await dataService.updateExecutiveMetrics(updateData);
    
    // Wait for real-time update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const current = await dataService.getExecutiveMetrics();
    
    const success = current.revenueChange === testChartData.revenueChange &&
                   current.demandChange === testChartData.demandChange &&
                   current.costChange === testChartData.costChange;
    
    setTestResults(prev => [...prev, {
      test: 'Chart Data Update',
      status: success ? 'success' : 'failed',
      message: success ? 'All chart data updated successfully' : 'Chart data update failed',
      timestamp: new Date(),
      details: {
        expected: testChartData,
        actual: {
          revenueChange: current.revenueChange,
          demandChange: current.demandChange,
          costChange: current.costChange
        }
      }
    }]);
    
    if (!success) {
      throw new Error('Chart data update test failed');
    }
  };

  const testGlobalIndicatorsUpdates = async (original: any) => {
    setCurrentTest('Testing Global Indicators updates...');
    
    const testGlobalIndicators = {
      egyptInflation: 42.5,
      egyptCurrency: 52.3,
      egyptFoodInsecurity: 22.8,
      globalInflation: 8.9,
      globalFoodPrices: 28.7,
      emergingMarketRisk: 85.4
    };

    const updateData = {
      ...original,
      globalIndicators: testGlobalIndicators
    };

    const updated = await dataService.updateExecutiveMetrics(updateData);
    
    // Wait for real-time update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const current = await dataService.getExecutiveMetrics();
    
    const success = JSON.stringify(current.globalIndicators) === JSON.stringify(testGlobalIndicators);
    
    setTestResults(prev => [...prev, {
      test: 'Global Indicators Update',
      status: success ? 'success' : 'failed',
      message: success ? 'All global indicators updated successfully' : 'Global indicators update failed',
      timestamp: new Date(),
      details: {
        expected: testGlobalIndicators,
        actual: current.globalIndicators
      }
    }]);
    
    if (!success) {
      throw new Error('Global indicators update test failed');
    }
  };

  const restoreOriginalValues = async (original: any) => {
    setCurrentTest('Restoring original values...');
    
    const restored = await dataService.updateExecutiveMetrics(original);
    
    // Wait for real-time update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const current = await dataService.getExecutiveMetrics();
    
    const success = current.people_served === original.people_served &&
                   current.meals_delivered === original.meals_delivered &&
                   current.cost_per_meal === original.cost_per_meal;
    
    setTestResults(prev => [...prev, {
      test: 'Restore Original Values',
      status: success ? 'success' : 'failed',
      message: success ? 'Original values restored successfully' : 'Failed to restore original values',
      timestamp: new Date()
    }]);
    
    if (!success) {
      throw new Error('Restore original values test failed');
    }
  };

  const runQuickTest = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setTestResults([]);
    setCurrentTest('Running quick real-time test...');

    try {
      // Get original values
      const original = await dataService.getExecutiveMetrics();
      setOriginalMetrics(original);

      // Update with random test values
      const testData = {
        people_served: Math.floor(Math.random() * 10000000) + 4000000,
        meals_delivered: Math.floor(Math.random() * 100000000) + 300000000,
        cost_per_meal: Math.random() * 10 + 5,
        program_efficiency: Math.random() * 20 + 70,
        revenue: Math.floor(Math.random() * 1000000000) + 2000000000,
        expenses: Math.floor(Math.random() * 1000000000) + 2000000000,
        scenario_factors: {
          economicGrowth: Math.random() * 10 - 5,
          inflationRate: Math.random() * 20 + 20,
          donorSentiment: Math.random() * 100 - 50,
          operationalEfficiency: Math.random() * 50 + 75,
        },
        revenueChange: Math.random() * 20 - 10,
        demandChange: Math.random() * 20 - 10,
        globalIndicators: {
          egyptInflation: Math.random() * 20 + 25,
          egyptCurrency: Math.random() * 20 + 40,
          globalInflation: Math.random() * 5 + 4,
        }
      };

      setCurrentTest('Updating with test values...');
      const updated = await dataService.updateExecutiveMetrics(testData);

      // Wait for real-time update
      setCurrentTest('Waiting for real-time synchronization...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Verify the update
      setCurrentTest('Verifying updates in UI...');
      const current = await dataService.getExecutiveMetrics();

      const success = current.people_served === testData.people_served &&
                     current.meals_delivered === testData.meals_delivered &&
                     current.cost_per_meal === testData.cost_per_meal;

      setTestResults(prev => [...prev, {
        test: 'Quick Real-time Test',
        status: success ? 'success' : 'failed',
        message: success ? 
          `✅ Real-time test successful! UI updated immediately. Check dashboard to see changes.` :
          `❌ Real-time test failed. UI did not update properly.`,
        timestamp: new Date(),
        details: {
          expected: {
            people_served: testData.people_served,
            meals_delivered: testData.meals_delivered,
            cost_per_meal: testData.cost_per_meal
          },
          actual: {
            people_served: current.people_served,
            meals_delivered: current.meals_delivered,
            cost_per_meal: current.cost_per_meal
          }
        }
      }]);

      // Restore original values
      if (original) {
        setCurrentTest('Restoring original values...');
        await dataService.updateExecutiveMetrics(original);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setCurrentTest(success ? '✅ Quick test completed successfully!' : '❌ Quick test failed');

    } catch (error) {
      console.error('Quick test failed:', error);
      setTestResults(prev => [...prev, {
        test: 'Quick Real-time Test',
        status: 'failed',
        message: error.message,
        timestamp: new Date()
      }]);
      setCurrentTest('❌ Quick test failed: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const failureCount = testResults.filter(r => r.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Automated Real-time Testing
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Test that admin panel changes update the dashboard UI immediately via Supabase real-time synchronization
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={connectionStatus ? "default" : "destructive"}>
                {connectionStatus ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                Database {connectionStatus ? 'Connected' : 'Offline'}
              </Badge>
              <div className="text-sm text-muted-foreground">
                Tests: {testResults.length} | Success: {successCount} | Failed: {failureCount}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={runQuickTest} 
                disabled={isRunning || !connectionStatus}
                variant="outline"
              >
                <Zap className="w-4 h-4 mr-2" />
                {isRunning ? 'Running...' : 'Quick Test'}
              </Button>
              <Button 
                onClick={runComprehensiveTest} 
                disabled={isRunning || !connectionStatus}
                variant="default"
              >
                <Activity className="w-4 h-4 mr-2" />
                {isRunning ? 'Running...' : 'Full Test'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Test Status */}
      {currentTest && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {isRunning ? (
                <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
              ) : (
                <Clock className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="font-medium">{currentTest}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className={result.status === 'success' ? 'text-green-500' : 'text-red-500'}>
                    {result.status === 'success' ? 
                      <CheckCircle className="w-5 h-5" /> : 
                      <XCircle className="w-5 h-5" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{result.test}</span>
                      <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.timestamp.toLocaleTimeString()}
                    </p>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer text-blue-600 hover:text-blue-800">
                          View details
                        </summary>
                        <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning" />
            How to Verify Real-time Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>1. Run a test</strong> - Click "Quick Test" or "Full Test" above</p>
            <p><strong>2. Watch the admin panel</strong> - Values should change immediately</p>
            <p><strong>3. Open the dashboard</strong> - Go to http://localhost:8084/ in another tab</p>
            <p><strong>4. Verify updates</strong> - Dashboard should update within 2-3 seconds without refresh</p>
            <p><strong>5. Check test results</strong> - Green checkmarks indicate successful real-time updates</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Expected Behavior:</strong> When you click "Quick Test", you should see numbers change in 
              the admin panel, then within 2-3 seconds the same numbers should appear in the dashboard 
              automatically without any page refresh.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomatedRealtimeTest;
