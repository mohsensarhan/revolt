import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Calculator, Database, Target, AlertCircle } from 'lucide-react';

interface MetricDetailProps {
  isOpen: boolean;
  onClose: () => void;
  metric: {
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
  };
}

export function MetricDetailModal({ isOpen, onClose, metric }: MetricDetailProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Database className="w-6 h-6 text-primary" />
            {metric.title} - Deep Analysis
          </DialogTitle>
          <DialogDescription>
            Comprehensive analysis including methodology, benchmarks, and strategic recommendations for this key performance indicator
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Value & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-success" />
                Current Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">{metric.value}</div>
              <p className="text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>

          {/* Methodology */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="w-5 h-5 text-warning" />
                Calculation Methodology
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{metric.methodology}</p>
              {metric.formula && (
                <div className="bg-muted/30 p-3 rounded-md font-mono text-sm">
                  <strong>Formula:</strong> {metric.formula}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="text-primary border-primary">
                  Data Source: {metric.dataSource}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Interpretation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-success" />
                Strategic Interpretation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{metric.interpretation}</p>
              <div className="bg-accent/10 p-3 rounded-md">
                <h4 className="font-semibold mb-2">Significance:</h4>
                <p className="text-sm">{metric.significance}</p>
              </div>
            </CardContent>
          </Card>

          {/* Benchmarks */}
          {metric.benchmarks && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Industry Benchmarks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metric.benchmarks.map((benchmark, index) => (
                    <div key={`${benchmark.label}-${index}`} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                      <span className="text-sm font-medium">{benchmark.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{benchmark.value}</span>
                        <Badge variant={
                          benchmark.status === 'good' ? 'default' : 
                          benchmark.status === 'warning' ? 'secondary' : 'destructive'
                        }>
                          {benchmark.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Influencing Factors */}
          {metric.factors && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Influencing Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {metric.factors.map((factor, index) => (
                    <div key={`factor-${index}`} className="flex items-start gap-3 p-2">
                      <AlertCircle className="w-4 h-4 text-warning mt-0.5" />
                      <div>
                        <span className="font-medium text-sm">{factor.factor}:</span>
                        <span className="text-sm text-muted-foreground ml-1">{factor.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {metric.recommendations && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Strategic Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {metric.recommendations.map((rec, index) => (
                    <li key={`rec-${index}`} className="flex items-start gap-2 text-sm">
                      <span className="text-primary">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}