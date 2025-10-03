import { useState, useEffect, useCallback } from 'react';
import { dataService, ExecutiveMetrics } from '@/lib/data-service';

export interface UseRealtimeMetricsReturn {
  metrics: ExecutiveMetrics | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateMetrics: (updates: Partial<ExecutiveMetrics>) => Promise<boolean>;
}

/**
 * Hook for real-time metrics with automatic Supabase sync
 * Subscribes to database changes and provides update methods
 */
export function useRealtimeMetrics(): UseRealtimeMetricsReturn {
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial metrics
  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dataService.getExecutiveMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Error loading metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update metrics
  const updateMetrics = useCallback(async (updates: Partial<ExecutiveMetrics>): Promise<boolean> => {
    try {
      const updated = await dataService.updateExecutiveMetrics(updates);
      if (updated) {
        setMetrics(updated);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to update metrics');
      return false;
    }
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    loadMetrics();

    // Subscribe to real-time changes
    const unsubscribe = dataService.subscribeToExecutiveMetrics((updatedMetrics) => {
      console.log('📡 Real-time metrics update received:', updatedMetrics);
      setMetrics(updatedMetrics);
      setError(null);
    });

    return () => {
      unsubscribe();
    };
  }, [loadMetrics]);

  return {
    metrics,
    loading,
    error,
    refresh: loadMetrics,
    updateMetrics,
  };
}
