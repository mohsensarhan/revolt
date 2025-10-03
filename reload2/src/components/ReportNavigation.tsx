import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Settings, 
  MapPin, 
  TrendingUp,
  Target,
  Globe,
  Zap,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'in-progress' | 'draft';
  keyMetrics: { label: string; value: string }[];
}

interface ReportNavigationProps {
  currentSection: string;
  onSectionChange: (sectionId: string) => void;
  onMobileMenuClose?: () => void;
}

export function ReportNavigation({ currentSection, onSectionChange, onMobileMenuClose }: ReportNavigationProps) {
  const sections: ReportSection[] = [
    {
      id: 'executive',
      title: 'Executive Dashboard',
      description: 'High-level KPIs and organizational health overview',
      icon: <BarChart3 className="w-5 h-5" />,
      status: 'completed',
      keyMetrics: [
        { label: 'People Served', value: '4.96M' },
        { label: 'Meals Delivered', value: '367.5M' },
        { label: 'Cost Efficiency', value: 'EGP 6.36' }
      ]
    },
    {
      id: 'financial',
      title: 'Financial Analytics',
      description: 'Revenue analysis, cost management & sustainability metrics',
      icon: <DollarSign className="w-5 h-5" />,
      status: 'completed',
      keyMetrics: [
        { label: 'Revenue', value: 'EGP 2.20B' },
        { label: 'Program Ratio', value: '83%' },
        { label: 'Reserve Months', value: '4.0' }
      ]
    },
    {
      id: 'operational',
      title: 'Operations Excellence',
      description: 'Distribution efficiency, logistics & quality control',
      icon: <Zap className="w-5 h-5" />,
      status: 'completed',
      keyMetrics: [
        { label: 'Distribution Rate', value: '94.7%' },
        { label: 'Cost per Person', value: 'EGP 459' },
        { label: 'Partner Network', value: '5,000+' }
      ]
    },
    {
      id: 'programs',
      title: 'Program Impact',
      description: 'Protection, Prevention & Empowerment pillars analysis',
      icon: <Target className="w-5 h-5" />,
      status: 'completed',
      keyMetrics: [
        { label: 'Stunting Reduction', value: '86%' },
        { label: 'School Feeding', value: '125K' },
        { label: 'Empowerment', value: '6.4K' }
      ]
    },
    {
      id: 'stakeholders',
      title: 'Stakeholder Intelligence',
      description: 'Brand performance, partnerships & digital engagement',
      icon: <Users className="w-5 h-5" />,
      status: 'completed',
      keyMetrics: [
        { label: 'Brand Awareness', value: '84%' },
        { label: 'NPS Score', value: '41' },
        { label: 'Volunteers', value: '93K+' }
      ]
    },
    {
      id: 'scenarios',
      title: 'Scenario Modeling',
      description: 'Advanced econometric modeling and sensitivity analysis',
      icon: <Settings className="w-5 h-5" />,
      status: 'completed',
      keyMetrics: [
        { label: 'Variables', value: '8+' },
        { label: 'Model R²', value: '84.7%' },
        { label: 'Forecast Accuracy', value: '89.3%' }
      ]
    },
    {
      id: 'governance',
      title: 'Governance & Risk',
      description: 'Board oversight, compliance & risk management',
      icon: <Award className="w-5 h-5" />,
      status: 'completed',
      keyMetrics: [
        { label: 'Board Meetings', value: '12' },
        { label: 'Audit Score', value: '96%' },
        { label: 'Compliance Rate', value: '100%' }
      ]
    },
    {
      id: 'sustainability',
      title: 'Sustainability Impact',
      description: 'Environmental footprint & sustainable development goals',
      icon: <Globe className="w-5 h-5" />,
      status: 'completed',
      keyMetrics: [
        { label: 'SDG Targets', value: '12/17' },
        { label: 'Carbon Footprint', value: '-15%' },
        { label: 'Circular Economy', value: '78%' }
      ]
    }
  ];

  return (
    <div className="space-y-2">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">Report Sections</h3>
        <p className="text-xs text-muted-foreground">Navigate through impact analysis</p>
      </div>

      <div className="space-y-2">
        {sections.map((section) => (
          <Card 
            key={section.id} 
            className={cn(
              "executive-card-hover cursor-pointer transition-all duration-300 p-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              currentSection === section.id && "ring-2 ring-primary shadow-glow bg-primary/5"
            )}
            onClick={() => {
              onSectionChange(section.id);
              onMobileMenuClose?.();
            }}
            role="button"
            tabIndex={0}
            aria-pressed={currentSection === section.id}
            aria-label={`Navigate to ${section.title} section`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSectionChange(section.id);
                onMobileMenuClose?.();
              }
            }}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className={cn(
                  "p-1.5 sm:p-2 rounded-lg flex-shrink-0",
                  currentSection === section.id 
                    ? "bg-primary/20 text-primary" 
                    : "bg-muted/30 text-muted-foreground"
                )} aria-hidden="true">
                  {section.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={cn(
                      "font-semibold text-sm truncate",
                      currentSection === section.id && "text-primary"
                    )}>
                      {section.title}
                    </h4>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs ml-2 flex-shrink-0",
                        section.status === 'completed' && "text-success border-success/50",
                        section.status === 'in-progress' && "text-warning border-warning/50",
                        section.status === 'draft' && "text-muted-foreground border-muted"
                      )}
                      aria-label={`Status: ${section.status}`}
                    >
                      ✓
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {section.description}
                  </p>
                  
                  <div className="space-y-1" role="list" aria-label="Key metrics">
                    {section.keyMetrics.slice(0, 2).map((metric, idx) => (
                      <div key={idx} className="flex justify-between text-xs" role="listitem">
                        <span className="text-muted-foreground truncate" aria-label={`${metric.label}:`}>{metric.label}</span>
                        <span className="font-medium text-foreground ml-2 flex-shrink-0" aria-label={metric.value}>{metric.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}