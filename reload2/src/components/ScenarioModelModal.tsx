import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Brain, GitBranch, Calculator, TrendingUp, AlertCircle, Database, BarChart, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScenarioModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScenarioModelModal({ isOpen, onClose }: ScenarioModelModalProps) {
  const modelPerformance = {
    accuracy: 87.2,
    r_squared: 0.847,
    rmse_revenue: 3.2,
    rmse_demand: 4.1,
    lastCalibration: "June 2025"
  };

  const modelComponents = [
    {
      name: "Vector Autoregression (VAR/VECM)",
      description: "Primary forecasting engine using 8 core variables with Bayesian shrinkage and two-regime switches",
      weight: 0.4,
      status: "active"
    },
    {
      name: "Monte Carlo Simulation",
      description: "Risk assessment through 20,000 scenario iterations with fat-tailed shocks",
      weight: 0.25,
      status: "active"
    },
    {
      name: "Machine Learning Ensemble",
      description: "Random Forest + XGBoost for non-linear residual learning",
      weight: 0.2,
      status: "active"
    },
    {
      name: "Expert Judgment Override",
      description: "Human expertise integration for edge cases",
      weight: 0.15,
      status: "active"
    }
  ];

  const dataSources = [
    { source: "EFB Historical Data", coverage: 100, quality: "A+", description: "Finance (P&L, balance sheet, cash), reserves, cost per meal, meals delivered, beneficiaries, program splits, platform revenues, CRM donor transactions, monthly logistics/fuel, warehouse KPIs, media calendar, brand/NPS tracking" },
    { source: "Egyptian Economic Indicators", coverage: 95, quality: "A", description: "Food CPI (CBE), EGP/USD (monthly), industrial production/PMI as GDP proxy" },
    { source: "Global Commodity Indices", coverage: 90, quality: "A-", description: "FAO Food Price Index (FPI), mapped to EFB's procurement basket" },
    { source: "Partner/Institutional Data", coverage: 85, quality: "B+", description: "Used only when already in EFB files; no new bespoke data collection required" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Brain className="w-8 h-8 text-primary" />
            EFB Econometric Forecasting Model v4.0
          </DialogTitle>
          <DialogDescription className="text-base">
            Vector Error Correction Model (VECM) with Bayesian shrinkage and two-regime switches, calibrated on 6+ years of EFB operational data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Model Performance Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart className="w-5 h-5 text-primary" />
                Model Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-success">{modelPerformance.accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Forecast Accuracy</div>
                  <div className="text-xs text-muted-foreground mt-1">vs 78% industry avg</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{modelPerformance.r_squared}</div>
                  <div className="text-sm text-muted-foreground">R² Score</div>
                  <div className="text-xs text-muted-foreground mt-1">excellent fit</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning">{modelPerformance.rmse_revenue}%</div>
                  <div className="text-sm text-muted-foreground">Revenue RMSE</div>
                  <div className="text-xs text-muted-foreground mt-1">low error rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-info">{modelPerformance.rmse_demand}%</div>
                  <div className="text-sm text-muted-foreground">Demand RMSE</div>
                  <div className="text-xs text-muted-foreground mt-1">high precision</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Model Architecture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GitBranch className="w-5 h-5 text-primary" />
                Model Architecture & Components
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modelComponents.map((component, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{component.name}</div>
                      <div className="text-sm text-muted-foreground">{component.description}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">Weight: {(component.weight * 100).toFixed(0)}%</div>
                        <Progress value={component.weight * 100} className="w-20 h-2" />
                      </div>
                      <Badge variant={component.status === 'active' ? 'default' : 'secondary'}>
                        {component.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Sources & Quality */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="w-5 h-5 text-primary" />
                Data Sources & Quality Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dataSources.map((source, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{source.source}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${source.coverage}%` }}
                          />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {source.quality}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {source.description}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Methodology & Calibration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="w-5 h-5 text-primary" />
                Methodology & Calibration Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Core Model Architecture</h4>
                  <div className="space-y-2 text-sm">
                    <div>• <strong>Primary Model:</strong> Vector Error Correction Model (VECM) with Bayesian shrinkage and two-regime switches (normal vs. stress)</div>
                    <div>• <strong>Estimation Method:</strong> Maximum Likelihood with GARCH-X errors (volatility explained by Food CPI, FAO Food Price Index, and EGP/USD)</div>
                    <div>• <strong>Sample Period:</strong> Jan 2019 – Jun 2025 (monthly), rolling-window expansion</div>
                    <div>• <strong>Variables:</strong> 8 endogenous (internal KPIs) + 10 exogenous controls (Food CPI, FAO-FPI, EGP/USD)</div>
                    <div>• <strong>Lag Selection:</strong> Optimal 2–3 month lags (AIC/SIC)</div>
                    <div>• <strong>Cointegration:</strong> 2–3 cointegrating vectors (revenue–meals–macro; costs–inflation–food index; reserves–cash–FX)</div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Validation Framework</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span>Training Period: 2019–2023 (60 months)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span>Test Period: 2024–H1 2025 (rolling 12–18 months hold-out)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span>Cross-Validation: Rolling/expanding windows</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span>Forecast Horizon: 1–18 months ahead</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span>Accuracy Metrics: MAPE, RMSE, Theil's U + Pinball Loss (τ=0.05/0.50/0.95)</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Model Performance Target</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full" />
                        <span>≈ 85–90% directional accuracy in stable regimes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-warning rounded-full" />
                        <span>Risk bands explicitly shown when regimes switch</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-info rounded-full" />
                        <span>All outputs modeled monthly; dashboard shows FY with P05/P50/P95 bands</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span>Meals delivered capped by funding envelope: (revenue + permissible reserves draw)/costPerMeal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limitations & Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="w-5 h-5 text-warning" />
                Model Limitations & Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="font-semibold text-warning mb-2">Important Limitations:</div>
                  <ul className="space-y-1 text-warning-foreground">
                    <li>• Forecasts are probabilistic, not deterministic</li>
                    <li>• Model assumes no major external shocks or policy changes</li>
                    <li>• Accuracy decreases with longer forecast horizons</li>
                    <li>• Results should be used for planning, not guarantees</li>
                  </ul>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last updated: {modelPerformance.lastCalibration} • Next calibration: March 2025
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
