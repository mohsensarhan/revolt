import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, Target, DollarSign, Globe, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { BreadcrumbNavigation } from '@/components/BreadcrumbNavigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import efbLogo from '@/assets/efb-logo.png';
import { formatNumber, formatSimpleNumber, formatCurrency } from '@/lib/formatters';

interface DashboardMetrics {
  peopleServed: number;
  mealsDelivered: number;
  costPerMeal: number;
  coverage: number;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface DashboardLayoutProps {
  metrics: DashboardMetrics;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export function DashboardLayout({ metrics, sidebar, children, breadcrumbs = [] }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen bg-background font-sans flex w-full">
      {/* Vertical Sidebar Navigation - Desktop */}
      <div className={`${sidebarCollapsed ? 'w-0' : 'w-80'} bg-card border-r border-card-border flex-shrink-0 hidden lg:flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out`}>
        <div className={`${sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-all duration-300 ease-in-out w-80 flex flex-col h-full`}>
          {/* Header in Sidebar */}
          <div className="p-6 border-b border-card-border flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <img src={efbLogo} alt="EFB Logo" className="w-10 h-10" />
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  Impact Intelligence
                </h1>
                <p className="text-xs text-muted-foreground">
                  Real-time Analytics Center
                </p>
              </div>
            </div>
            
            {/* Key Metrics in Header */}
            <div className="grid grid-cols-2 gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label="Lives impacted metric"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-3 h-3 text-success" aria-hidden="true" />
                      <span className="text-xs text-muted-foreground">Lives</span>
                    </div>
                    <div className="text-sm font-bold text-foreground" data-testid="people-served-value">
                      {formatNumber(metrics.peopleServed)}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lives Impacted: {formatSimpleNumber(metrics.peopleServed)} people</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label="Meals delivered metric"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-3 h-3 text-warning" aria-hidden="true" />
                      <span className="text-xs text-muted-foreground">Meals</span>
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      {formatNumber(metrics.mealsDelivered)}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Meals Delivered: {formatSimpleNumber(metrics.mealsDelivered)} meals</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label="Cost per meal metric"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-3 h-3 text-danger" aria-hidden="true" />
                      <span className="text-xs text-muted-foreground">Cost</span>
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      {formatCurrency(metrics.costPerMeal, false)}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cost Per Meal: {formatCurrency(metrics.costPerMeal)}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    role="button"
                    tabIndex={0}
                    aria-label="Geographic coverage metric"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-3 h-3 text-primary" aria-hidden="true" />
                      <span className="text-xs text-muted-foreground">Coverage</span>
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      {metrics.coverage}/27
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Geographic Coverage: {metrics.coverage} governorates out of 27</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Status Badges */}
            <div className="flex gap-2 mt-4">
              <Badge variant="outline" className="text-success border-success text-xs">
                LIVE FY2024/25
              </Badge>
              <Badge variant="outline" className="text-primary border-primary text-xs">
                GLOBAL #3
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 flex-1 overflow-y-auto min-h-0">
            {sidebar}
          </div>
        </div>
      </div>

      {/* Sidebar Toggle Button - Desktop Only */}
      <div className="hidden lg:flex items-center justify-center relative z-20">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`${sidebarCollapsed ? 'translate-x-0' : '-translate-x-4'} transition-all duration-300 ease-in-out bg-card/95 backdrop-blur-sm border-card-border hover:bg-card hover:border-primary/50 shadow-lg h-16 w-8 rounded-r-lg rounded-l-none p-0 flex items-center justify-center group`}
          aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
        </Button>
      </div>
      {/* Main Content Area */}
      <div className={`${sidebarCollapsed ? 'flex-1' : 'flex-1'} flex flex-col min-w-0 overflow-hidden transition-all duration-300 ease-in-out`}>
        {/* Top Header with Breadcrumbs */}
        <header className="flex-shrink-0 z-10 bg-card/95 backdrop-blur-sm border-b border-card-border p-3 sm:p-4 shadow-sm">
          {breadcrumbs.length > 0 && (
            <BreadcrumbNavigation 
              items={breadcrumbs} 
              className="mb-3 sm:mb-4"
            />
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0 [&>button]:hidden">
                  <div className="h-full flex flex-col overflow-hidden">
                    {/* Mobile Sidebar Header */}
                    <div className="p-6 border-b border-card-border flex-shrink-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img src={efbLogo} alt="EFB Logo" className="w-10 h-10" />
                          <div>
                            <h1 className="text-lg font-bold text-foreground">
                              Impact Intelligence
                            </h1>
                            <p className="text-xs text-muted-foreground">
                              Real-time Analytics Center
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMobileMenuOpen(false)}
                          aria-label="Close navigation menu"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Key Metrics in Mobile Header */}
                      <div className="grid grid-cols-2 gap-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                              role="button"
                              tabIndex={0}
                              aria-label="Lives impacted metric"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Users className="w-3 h-3 text-success" aria-hidden="true" />
                                <span className="text-xs text-muted-foreground">Lives</span>
                              </div>
                              <div className="text-sm font-bold text-foreground">
                                {formatNumber(metrics.peopleServed)}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Lives Impacted: {formatSimpleNumber(metrics.peopleServed)} people</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                              role="button"
                              tabIndex={0}
                              aria-label="Meals delivered metric"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Target className="w-3 h-3 text-warning" aria-hidden="true" />
                                <span className="text-xs text-muted-foreground">Meals</span>
                              </div>
                              <div className="text-sm font-bold text-foreground">
                                {formatNumber(metrics.mealsDelivered)}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Meals Delivered: {formatSimpleNumber(metrics.mealsDelivered)} meals</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                              role="button"
                              tabIndex={0}
                              aria-label="Cost per meal metric"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="w-3 h-3 text-danger" aria-hidden="true" />
                                <span className="text-xs text-muted-foreground">Cost</span>
                              </div>
                              <div className="text-sm font-bold text-foreground">
                                {formatCurrency(metrics.costPerMeal, false)}
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Cost Per Meal: {formatCurrency(metrics.costPerMeal)}</p>
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                              role="button"
                              tabIndex={0}
                              aria-label="Geographic coverage metric"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Globe className="w-3 h-3 text-primary" aria-hidden="true" />
                                <span className="text-xs text-muted-foreground">Coverage</span>
                              </div>
                              <div className="text-sm font-bold text-foreground">
                                {metrics.coverage}/27
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Geographic Coverage: {metrics.coverage} governorates out of 27</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Status Badges */}
                      <div className="flex gap-2 mt-4">
                        <Badge variant="outline" className="text-success border-success text-xs">
                          LIVE FY2024/25
                        </Badge>
                        <Badge variant="outline" className="text-primary border-primary text-xs">
                          GLOBAL #3
                        </Badge>
                      </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="p-4 flex-1 overflow-y-auto min-h-0">
                      {React.cloneElement(sidebar as React.ReactElement, {
                        onMobileMenuClose: () => setMobileMenuOpen(false)
                      })}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">
                  Humanitarian Impact Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Advanced analytics and real-time monitoring of Egypt's largest food security operation
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main 
          className="flex-1 p-3 sm:p-6 overflow-y-auto overflow-x-hidden min-h-0" 
          role="main"
          aria-label="Dashboard content"
        >
          {children}
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 border-t border-card-border p-3 sm:p-4">
          <div className="text-center text-xs text-muted-foreground px-2">
            Comprehensive mission data for 367.5 million meals delivered across 27 governorates in FY2024/25
          </div>
        </footer>
      </div>
    </div>
  );
}