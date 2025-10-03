import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Metric Card Loading State
export function MetricCardSkeleton() {
  return (
    <Card className="executive-card">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-16 h-6 rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-24 h-8" />
            <Skeleton className="w-32 h-4" />
          </div>
          <Skeleton className="w-20 h-4" />
        </div>
      </CardContent>
    </Card>
  );
}

// Financial Health Grid Loading State
export function FinancialHealthSkeleton() {
  return (
    <Card className="executive-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="w-48 h-6" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-16 h-6 rounded-full" />
              </div>
              <Skeleton className="w-20 h-8" />
              <Skeleton className="w-full h-2 rounded-full" />
            </div>
          ))}
        </div>

        {/* Financial Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-muted/30">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="w-16 h-4" />
                </div>
                <Skeleton className="w-24 h-6" />
                <Skeleton className="w-20 h-4" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sustainability Score */}
        <Card className="bg-gradient-dark border border-primary/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="w-48 h-4" />
              </div>
              <Skeleton className="w-12 h-6 rounded-full" />
            </div>
            <Skeleton className="w-full h-3 rounded-full" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="w-20 h-4" />
                  <Skeleton className="w-12 h-4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

// Analytics Section Loading State
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="executive-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-48 h-6" />
          </div>
          <Skeleton className="w-64 h-4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 bg-muted/20 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="w-24 h-4" />
                  <Skeleton className="w-16 h-6 rounded-full" />
                </div>
                <Skeleton className="w-20 h-6" />
                <Skeleton className="w-full h-2 rounded-full" />
                <Skeleton className="w-32 h-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// General Loading Spinner
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

// Page Loading State
export function PageLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-64 h-8" />
          </div>
          <Skeleton className="w-96 h-4" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Financial Analysis Section */}
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-56 h-8" />
          </div>
          <Skeleton className="w-80 h-4" />
        </div>
        
        <FinancialHealthSkeleton />
      </section>

      {/* Analytics Section */}
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-48 h-8" />
          </div>
          <Skeleton className="w-72 h-4" />
        </div>
        
        <AnalyticsSkeleton />
      </section>
    </div>
  );
}