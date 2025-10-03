import React, { lazy } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { AnalyticsSkeleton } from './LoadingStates';

// Lazy load heavy analytics components
export const LazyAdvancedFinancialAnalytics = lazy(() => 
  import('./AdvancedFinancialAnalytics')
);

export const LazyOperationalAnalytics = lazy(() => 
  import('./OperationalAnalytics')
);

export const LazyProgramsAnalytics = lazy(() => 
  import('./ProgramsAnalytics')
);

export const LazyStakeholderAnalytics = lazy(() => 
  import('./StakeholderAnalytics')
);

export const LazyScenarioAnalysis = lazy(() => 
  import('./ScenarioAnalysis')
);

// Wrapper component with error boundary and loading state
export function LazyComponentWrapper({ 
  children, 
  fallback = <AnalyticsSkeleton /> 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <React.Suspense fallback={fallback}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
}