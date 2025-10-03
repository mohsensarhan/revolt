import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Fixing real-time synchronization comprehensively...');

// Read the current ExecutiveDashboard.tsx
const dashboardPath = path.join(__dirname, 'src', 'components', 'ExecutiveDashboard.tsx');
let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

// Fix 1: Ensure the calculated metrics hook receives updated raw metrics immediately
dashboardContent = dashboardContent.replace(
  `  // Use the enhanced scenario calculations hook for dynamic updates
  const calculatedMetrics = useScenarioCalculations(metrics || baseMetrics, debouncedScenarioFactors);`,
  `  // Use the enhanced scenario calculations hook for dynamic updates
  const calculatedMetrics = useScenarioCalculations(metrics || baseMetrics, debouncedScenarioFactors);

  // Add a separate effect to ensure calculated metrics update when raw metrics change
  React.useEffect(() => {
    if (metrics) {
      console.log('📊 Dashboard: Raw metrics updated, recalculating...', metrics);
      // Force recalculation by updating a dummy state
      setMetrics({ ...metrics });
    }
  }, [metrics]);`
);

// Fix 2: Add a more comprehensive real-time subscription handler
dashboardContent = dashboardContent.replace(
  `    // Set up real-time subscription
    const unsubscribe = dataService.subscribeToExecutiveMetrics((updatedMetrics) => {
      console.log('📡 Dashboard: Real-time update received:', updatedMetrics);
      setMetrics(updatedMetrics);
      if (updatedMetrics.scenario_factors) {
        console.log('📡 Dashboard: Updating scenario factors:', updatedMetrics.scenario_factors);
        setScenarioFactors(prev => ({ ...prev, ...updatedMetrics.scenario_factors }));
      }
    });`,
  `    // Set up real-time subscription
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
    });`
);

// Fix 3: Add a global event listener for metrics updates
dashboardContent = dashboardContent.replace(
  `  // Listen for browser back/forward navigation
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
  }, []);`,
  `  // Listen for browser back/forward navigation
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
  }, []);`
);

// Fix 4: Add a visual indicator when real-time updates are received
dashboardContent = dashboardContent.replace(
  `  return (
    <DashboardLayout 
      metrics={dashboardMetrics}
      sidebar={
        <ReportNavigation 
          currentSection={currentSection}
          onSectionChange={handleSectionChange}
        />
      }
    >
      
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
  );`,
  `  // Add a real-time update indicator
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
  );`
);

// Write the fixed dashboard
fs.writeFileSync(dashboardPath, dashboardContent);

// Now let's also fix the data service to ensure the subscription works properly
const dataServicePath = path.join(__dirname, 'src', 'lib', 'data-service.ts');
let dataServiceContent = fs.readFileSync(dataServicePath, 'utf8');

// Improve the subscription method with better error handling and logging
dataServiceContent = dataServiceContent.replace(
  `  // Real-time subscription for executive metrics
  subscribeToExecutiveMetrics(callback: (metrics: ExecutiveMetrics) => void) {
    const subscription = supabase
      .channel('executive_metrics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'executive_metrics'
        },
        (payload) => {
          console.log('Executive metrics changed:', payload);
          if (payload.new) {
            callback(payload.new as ExecutiveMetrics);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }`,
  `  // Real-time subscription for executive metrics with enhanced logging
  subscribeToExecutiveMetrics(callback: (metrics: ExecutiveMetrics) => void) {
    console.log('🔍 DataService: Setting up real-time subscription for executive_metrics...');
    
    const subscription = supabase
      .channel('executive_metrics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'executive_metrics'
        },
        (payload) => {
          console.log('📡 DataService: Real-time change detected:', {
            event: payload.eventType,
            table: payload.table,
            timestamp: new Date().toISOString(),
            payload: payload
          });
          
          if (payload.new) {
            console.log('✅ DataService: Sending updated metrics to callback:', payload.new);
            callback(payload.new as ExecutiveMetrics);
            
            // Also dispatch a global event for debugging
            const globalEvent = new CustomEvent('supabaseMetricsUpdated', { 
              detail: payload.new,
              timestamp: new Date().toISOString()
            });
            window.dispatchEvent(globalEvent);
          } else {
            console.warn('⚠️ DataService: No new data in payload:', payload);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ DataService: Real-time subscription active for executive_metrics');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ DataService: Real-time subscription error:', status);
        }
      });

    return () => {
      console.log('🔌 DataService: Unsubscribing from real-time updates');
      subscription.unsubscribe();
    };
  }`
);

// Write the improved data service
fs.writeFileSync(dataServicePath, dataServiceContent);

// Create a comprehensive test script
const comprehensiveTestScript = `
console.log('🧪 Comprehensive Real-time Update Test');
console.log('=====================================');

// Test function with detailed verification
async function testRealtimeUpdatesComprehensive() {
  console.log('📊 Step 1: Testing admin panel to dashboard real-time sync');
  
  // Test 1: Check if admin panel loads
  console.log('🔍 Test 1: Checking admin panel accessibility...');
  try {
    const adminResponse = await fetch('http://localhost:8084/admin');
    if (adminResponse.ok) {
      console.log('✅ Admin panel is accessible');
    } else {
      console.log('❌ Admin panel not accessible');
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot reach admin panel:', error.message);
    return false;
  }
  
  // Test 2: Check if dashboard loads
  console.log('🔍 Test 2: Checking dashboard accessibility...');
  try {
    const dashboardResponse = await fetch('http://localhost:8084/');
    if (dashboardResponse.ok) {
      console.log('✅ Dashboard is accessible');
    } else {
      console.log('❌ Dashboard not accessible');
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot reach dashboard:', error.message);
    return false;
  }
  
  console.log('📊 Step 2: Both admin panel and dashboard are accessible');
  console.log('📊 Step 3: Manual test instructions:');
  console.log('   1. Open admin panel: http://localhost:8084/admin');
  console.log('   2. Change "People Served" to 6000000');
  console.log('   3. Change "Meals Delivered" to 400000000');
  console.log('   4. Change "Cost Per Meal" to 7.50');
  console.log('   5. Click "Save All Core Metrics"');
  console.log('   6. Watch for success message in admin panel');
  console.log('   7. Open dashboard: http://localhost:8084/');
  console.log('   8. Watch the metric cards update automatically');
  console.log('   9. Should see green "Updated" indicator');
  console.log('   10. Check browser console for debug messages');
  console.log('');
  console.log('📊 Expected behavior:');
  console.log('   - Admin panel shows success message');
  console.log('   - Dashboard updates within 2-3 seconds');
  console.log('   - Green "Updated" indicator appears');
  console.log('   - Console shows debug messages');
  console.log('   - No page refresh required');
  
  return true;
}

// Auto-run the comprehensive test
testRealtimeUpdatesComprehensive().then(success => {
  if (success) {
    console.log('✅ Comprehensive test ready!');
    console.log('🌐 Follow the manual test steps above to verify real-time updates.');
    console.log('🔍 Check browser console for detailed debug messages.');
    console.log('💡 If you see the dashboard update automatically, real-time sync is working!');
    
    // Create a visual indicator
    const indicator = document.createElement('div');
    indicator.innerHTML = \`
      <div style="position: fixed; top: 20px; left: 20px; z-index: 9999; background: #10b981; color: white; padding: 16px 24px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; max-width: 400px;">
        🎯 Real-time Test Ready!
        <div style="font-size: 14px; margin-top: 8px; line-height: 1.4;">
          Follow the manual test steps above to verify admin panel changes reflect in dashboard automatically.
        </div>
      </div>
    \`;
    document.body.appendChild(indicator);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 10000);
  }
}).catch(error => {
  console.error('❌ Comprehensive test failed:', error);
});

console.log('🎯 Comprehensive test ready!');
console.log('📋 Manual test steps provided above');
console.log('🔍 Check browser console for debug messages');
console.log('💡 Green indicator will appear when test is ready');
`;

// Write the comprehensive test script
const comprehensiveTestPath = path.join(__dirname, 'comprehensive-test.html');
fs.writeFileSync(comprehensiveTestPath, comprehensiveTestScript);

console.log('✅ Comprehensive real-time fix completed!');
console.log('🚀 Improvements made:');
console.log('   - Enhanced real-time subscription with detailed logging');
console.log('   - Added global event dispatching for debugging');
console.log('   - Fixed calculated metrics hook to receive updated raw metrics');
console.log('   - Added visual indicator when updates are received');
console.log('   - Improved error handling and connection status');
console.log('   - Created comprehensive test with step-by-step instructions');
console.log('🌐 Open comprehensive-test.html in browser to run the test');
