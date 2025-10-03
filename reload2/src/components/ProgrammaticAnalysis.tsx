import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Shield, 
  Target, 
  TrendingUp, 
  Users, 
  School,
  Baby,
  Wheat,
  Heart,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgramData {
  name: string;
  meals: number;
  beneficiaries: number;
  avgMealsPerBeneficiary: number;
  percentage: number;
  programs: string[];
  icon: React.ReactNode;
  color: 'success' | 'warning' | 'primary';
}

export function ProgrammaticAnalysis() {
  const pillars: ProgramData[] = [
    {
      name: 'Protection',
      meals: 350900000,
      beneficiaries: 4890000,
      avgMealsPerBeneficiary: 72,
      percentage: 95.5,
      programs: [
        'Monthly Food Boxes (846K boxes)',
        'Ramadan Campaign (670K boxes)', 
        'Remote Area Distributions (88K boxes)',
        'Emergency & Crisis Response',
        'Winter Hot Meals (132K meals)',
        'Refugee Assistance (251K meals)'
      ],
      icon: <Shield className="w-6 h-6" />,
      color: 'success'
    },
    {
      name: 'Prevention',
      meals: 15900000,
      beneficiaries: 72000,
      avgMealsPerBeneficiary: 220,
      percentage: 4.3,
      programs: [
        'School & Nursery Feeding (80K students)',
        'Stunting Prevention (1K mothers)',
        'Elder Malnutrition Program (400 seniors)',
        'Nutrition-Sensitive Food Boxes',
        'Health Education Sessions'
      ],
      icon: <Target className="w-6 h-6" />,
      color: 'warning'
    },
    {
      name: 'Empowerment',
      meals: 700000,
      beneficiaries: 6400,
      avgMealsPerBeneficiary: 113,
      percentage: 0.2,
      programs: [
        'Small Poultry Farmers (500 women)',
        'Smallholder Farmers (1,085 farmers)',
        'Food Secure Villages (174 farmers)',
        'Wafra Social Enterprise Farm',
        'Date Palm Planting (745 farmers)'
      ],
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'primary'
    }
  ];

  const schoolFeeding = {
    studentsReached: 80000,
    schoolsEngaged: 43,
    nurseries: 148,
    dailyMeals: 9000000,
    globalRanking: 4,
    concentrationImprovement: '85%',
    attendanceIncrease: '12%',
    anemiaReduction: '23%'
  };

  const stunting = {
    mothersEnrolled: 1000,
    nutritionPacks: 21474,
    educationSessions: 6300,
    stuntingReduction: '14% to 2%',
    criticalWindow: '1000 days',
    evaluationResults: 'Severe stunting dropped from 14% to 2%'
  };

  const empowermentSuccess = {
    womenEmpowered: 500,
    farmersSupported: 1830,
    acresSupported: 2741,
    palmTreesPlanted: 18500,
    graduationRate: '23%',
    incomeIncrease: '40%+'
  };

  return (
    <div className="space-y-8">
      {/* Three Pillars Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {pillars.map((pillar) => (
          <Tooltip key={pillar.name}>
            <TooltipTrigger asChild>
              <Card className="executive-card-hover cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "p-3 rounded-lg",
                      pillar.color === 'success' && "bg-success/10 text-success",
                      pillar.color === 'warning' && "bg-warning/10 text-warning",
                      pillar.color === 'primary' && "bg-primary/10 text-primary"
                    )}>
                      {pillar.icon}
                    </div>
                    <Badge variant="outline" className={cn(
                      pillar.color === 'success' && "text-success border-success",
                      pillar.color === 'warning' && "text-warning border-warning",
                      pillar.color === 'primary' && "text-primary border-primary"
                    )}>
                      {pillar.percentage}%
                    </Badge>
                  </div>
                  <CardTitle>{pillar.name} Pillar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">
                        {(pillar.meals / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm text-muted-foreground">Meals</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">
                        {(pillar.beneficiaries / 1000).toFixed(0)}K
                      </div>
                      <div className="text-sm text-muted-foreground">People</div>
                    </div>
                  </div>
                  
                  <Progress 
                    value={pillar.percentage} 
                    className="h-3"
                  />
                  
                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {pillar.avgMealsPerBeneficiary} meals/person
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Average annual support
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm p-4">
              <div className="space-y-2">
                <h4 className="font-semibold">{pillar.name} Programs</h4>
                <div className="text-xs space-y-1">
                  {pillar.programs.map((program, idx) => (
                    <div key={idx}>• {program}</div>
                  ))}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Detailed Program Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* School Feeding Deep Dive */}
        <Card className="executive-card">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2">
              <School className="w-5 h-5 text-warning" />
              School Feeding Program
            </CardTitle>
            <div className="flex gap-2 mt-3">
              <Badge variant="outline" className="text-warning border-warning">
                Global #4
              </Badge>
              <Badge variant="outline" className="text-success border-success">
                80K Daily Reach
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {schoolFeeding.studentsReached.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Students Fed Daily</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {schoolFeeding.schoolsEngaged}
                  </div>
                  <div className="text-sm text-muted-foreground">Schools</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {schoolFeeding.nurseries}
                  </div>
                  <div className="text-sm text-muted-foreground">Nurseries</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {schoolFeeding.globalRanking}
                  </div>
                  <div className="text-sm text-muted-foreground">Global Rank</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Concentration Improvement</span>
                <span className="font-semibold text-success">{schoolFeeding.concentrationImprovement}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Attendance Increase</span>
                <span className="font-semibold text-success">{schoolFeeding.attendanceIncrease}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Anemia Reduction</span>
                <span className="font-semibold text-success">{schoolFeeding.anemiaReduction}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stunting Prevention */}
        <Card className="executive-card">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-2">
              <Baby className="w-5 h-5 text-primary" />
              Stunting Prevention (Forsa Oula)
            </CardTitle>
            <Badge variant="outline" className="text-primary border-primary mt-3">
              Critical 1000 Days
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-primary">
                14% → 2%
              </div>
              <div className="text-sm text-muted-foreground">
                Severe Stunting Reduction
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xl font-bold">{stunting.mothersEnrolled}</div>
                <div className="text-xs text-muted-foreground">Mothers Enrolled</div>
              </div>
              <div>
                <div className="text-xl font-bold">{stunting.nutritionPacks.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Nutrition Packs</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Education Sessions</span>
                <span className="font-semibold">{stunting.educationSessions}+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Target Window</span>
                <span className="font-semibold">{stunting.criticalWindow}</span>
              </div>
            </div>
            
            <div className="bg-primary/10 p-3 rounded-lg">
              <div className="text-sm font-medium text-primary">Impact Evaluation</div>
              <div className="text-xs text-muted-foreground mt-1">
                First rigorous RCT evaluation in Egypt showing significant reduction in child malnutrition
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empowerment Success Stories */}
      <Card className="executive-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Empowerment Success: Building Self-Reliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{empowermentSuccess.womenEmpowered}</div>
              <div className="text-sm text-muted-foreground">Women in Poultry Program</div>
              <div className="text-xs text-success mt-1">First-time income earners</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{empowermentSuccess.farmersSupported}</div>
              <div className="text-sm text-muted-foreground">Farmers Supported</div>
              <div className="text-xs text-success mt-1">Across multiple governorates</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{empowermentSuccess.acresSupported}</div>
              <div className="text-sm text-muted-foreground">Acres Supported</div>
              <div className="text-xs text-success mt-1">Enhanced productivity</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{empowermentSuccess.graduationRate}</div>
              <div className="text-sm text-muted-foreground">Graduation Rate</div>
              <div className="text-xs text-success mt-1">No longer need aid</div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-success/10 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wheat className="w-4 h-4 text-success" />
                <span className="font-medium">Agricultural Impact</span>
              </div>
              <div className="text-sm text-muted-foreground">
                2,741 acres enhanced with quality seeds and training. 18,500 date palm trees planted for long-term investment.
              </div>
            </div>
            
            <div className="bg-gradient-primary/10 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium">Women's Empowerment</span>
              </div>
              <div className="text-sm text-muted-foreground">
                500 rural women now generate income through micro-poultry farms, gaining decision-making power.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}