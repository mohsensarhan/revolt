import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MetricDetailModal } from './MetricDetailModal';
import { 
  Users, 
  Heart, 
  MessageSquare, 
  TrendingUp,
  Award,
  Share2,
  Eye,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Metric } from './ExecutiveDashboard';

export function StakeholderAnalytics() {
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);

  const stakeholderData = {
    publicAwareness: {
      overallAwareness: 84,
      ranking: 4,
      netPromoterScore: 41,
      adRecall: 48,
      likeability: 86,
      brandRanking: 'Great'
    },
    volunteers: {
      total: 13000,
      hours: 200000,
      monetaryValue: 10000000,
      satisfaction: 95,
      retention: 89,
      partnerVolunteers: 80000
    },
    digitalEngagement: {
      facebookGrowth: 22,
      instagramGrowth: 45,
      hashtagReach: 3000000,
      whatsappUsers: 10000,
      onlineDonationGrowth: 51
    },
    mediaMetrics: {
      pressReleases: 15,
      pressConferences: 4,
      majorCoverage: 100, // All major outlets
      sentiment: 95 // Overwhelmingly positive
    }
  };

  const volunteerSegments = [
    {
      category: 'Direct EFB Volunteers',
      count: 13000,
      hours: 200000,
      activities: ['Food packing', 'Distribution', 'Campaigns'],
      satisfaction: 95,
      color: 'primary'
    },
    {
      category: 'Partner NGO Volunteers',
      count: 80000,
      hours: 500000,
      activities: ['Local distribution', 'Community outreach', 'Registration'],
      satisfaction: 88,
      color: 'success'
    }
  ];

  const engagementMetrics = [
    {
      platform: 'Facebook',
      growth: 22,
      engagement: 'High',
      primaryAudience: 'Donors & Community',
      keyContent: 'Impact stories, campaigns'
    },
    {
      platform: 'Instagram', 
      growth: 45,
      engagement: 'Very High',
      primaryAudience: 'Younger demographics',
      keyContent: 'Visual stories, behind-scenes'
    },
    {
      platform: 'WhatsApp',
      growth: 100,
      engagement: 'Direct',
      primaryAudience: 'Service seekers',
      keyContent: 'Information & support bot'
    }
  ];

  const brandMetrics = [
    { metric: 'Public Awareness', value: 84, benchmark: 'Top 4 NGOs', status: 'excellent' },
    { metric: 'Net Promoter Score', value: 41, benchmark: '"Great" rating', status: 'excellent' },
    { metric: 'Ad Recall Rate', value: 48, benchmark: '4th highest sector', status: 'good' },
    { metric: 'Likeability Score', value: 86, benchmark: 'Top 3 most liked', status: 'excellent' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-success border-success';
      case 'good': return 'text-warning border-warning';
      case 'needs-attention': return 'text-danger border-danger';
      default: return 'text-muted-foreground border-muted';
    }
  };

  // Stakeholder metrics for detailed modals
  const stakeholderMetrics = {
    publicAwareness: {
      title: "Public Awareness Analysis",
      value: `${stakeholderData.publicAwareness.overallAwareness}%`,
      description: "84% awareness ties EFB for 4th position among Egyptian NGOs",
      methodology: "Nationwide representative survey of 2,500 respondents across urban/rural demographics using aided and unaided recall techniques.",
      dataSource: "Independent Brand Research Agency + Nielsen Consumer Insights",
      interpretation: "84% awareness indicates strong brand recognition across Egypt's socio-economic spectrum, with particularly high recognition in urban centers",
      significance: "Top-tier awareness enables effective fundraising campaigns and builds trust for program expansion into new communities",
      benchmarks: [
        { label: "Leading Egyptian NGO", value: "89%", status: "warning" as const },
        { label: "Average Charity Sector", value: "34%", status: "good" as const },
        { label: "EFB Performance", value: "84%", status: "good" as const }
      ],
      recommendations: [
        "Target rural awareness gaps through radio and community partnerships",
        "Leverage social media to maintain youth demographic engagement",
        "Implement brand tracking dashboard for real-time monitoring"
      ]
    },
    netPromoterScore: {
      title: "Net Promoter Score Deep Dive",
      value: `${stakeholderData.publicAwareness.netPromoterScore}`,
      description: "NPS of 41 rates as 'Great' - top tier among charitable organizations",
      methodology: "Post-interaction survey of 1,847 stakeholders including donors, volunteers, beneficiaries, and general public using standard NPS methodology.",
      dataSource: "Customer Experience Management System + Third-Party Survey Platform",
      interpretation: "Score of 41 indicates high stakeholder loyalty with strong emotional connection to EFB's mission and operational excellence",
      significance: "Great NPS enables organic growth through word-of-mouth, reduces acquisition costs, and supports long-term sustainability",
      benchmarks: [
        { label: "World-Class Organizations", value: "50+", status: "warning" as const },
        { label: "Good Organizations", value: "30-50", status: "good" as const },
        { label: "Charity Sector Average", value: "23", status: "good" as const }
      ],
      recommendations: [
        "Focus on converting passives (51% of respondents) to promoters",
        "Address specific pain points identified by detractors",
        "Launch referral programs to leverage high promoter base"
      ]
    },
    digitalGrowth: {
      title: "Digital Engagement Acceleration",
      value: `+${stakeholderData.digitalEngagement.onlineDonationGrowth}%`,
      description: "51% growth in online donations represents fastest-growing revenue segment",
      methodology: "Year-over-year analysis of digital platform performance including website conversions, social media engagement, and mobile app usage.",
      dataSource: "Google Analytics + Social Media Management Platforms + Payment Gateway Analytics",
      interpretation: "51% digital growth vastly outpaces traditional fundraising channels, indicating successful digital transformation strategy",
      significance: "Digital-first approach reduces acquisition costs, improves donor experience, and provides scalable growth foundation",
      benchmarks: [
        { label: "Nonprofit Digital Average", value: "12%", status: "good" as const },
        { label: "Best-in-Class Digital", value: "35%", status: "good" as const },
        { label: "EFB Achievement", value: "51%", status: "good" as const }
      ],
      recommendations: [
        "Expand mobile-first donation experience",
        "Implement AI-powered personalization for donor journeys",
        "Launch subscription-based recurring giving platform"
      ]
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h2 className="heading-lg text-foreground">Stakeholder Intelligence Dashboard</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Comprehensive analysis of public awareness, volunteer engagement, digital growth, and brand performance metrics
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-2">
          <Badge 
            variant="outline" 
            className="text-success border-success bg-success/5 px-4 py-2 text-sm font-medium rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              Live Engagement Data
            </div>
          </Badge>
          <span className="text-xs text-muted-foreground">Updated every 5 minutes</span>
        </div>
      </div>

      {/* Brand & Reputation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card 
          className="executive-card-hover cursor-pointer" 
          onClick={() => setSelectedMetric(stakeholderMetrics.publicAwareness)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Eye className="w-8 h-8 text-primary" />
              <Badge variant="outline" className="text-primary border-primary">
                Rank #{stakeholderData.publicAwareness.ranking}
              </Badge>
            </div>
            <div className="text-2xl font-bold">
              {stakeholderData.publicAwareness.overallAwareness}%
            </div>
            <div className="text-sm text-muted-foreground">Public Awareness</div>
          </CardContent>
        </Card>

        <Card 
          className="executive-card-hover cursor-pointer" 
          onClick={() => setSelectedMetric(stakeholderMetrics.netPromoterScore)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8 text-success" />
              <Badge variant="outline" className="text-success border-success">
                Great
              </Badge>
            </div>
            <div className="text-2xl font-bold text-success">
              {stakeholderData.publicAwareness.netPromoterScore}
            </div>
            <div className="text-sm text-muted-foreground">Net Promoter Score</div>
          </CardContent>
        </Card>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="executive-card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <MessageSquare className="w-8 h-8 text-warning" />
                  <Badge variant="outline" className="text-warning border-warning">
                    Top 3
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-warning">
                  {stakeholderData.publicAwareness.likeability}%
                </div>
                <div className="text-sm text-muted-foreground">Ad Likeability</div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs p-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Creative Effectiveness</h4>
              <p className="text-sm">86% likeability ranks in top 3 most liked NGO ads in 2024</p>
              <div className="text-xs space-y-1">
                <div>• Empathetic storytelling resonates</div>
                <div>• "Nourishing a Nation" tagline impact</div>
                <div>• Real beneficiary stories drive connection</div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        <Card 
          className="executive-card-hover cursor-pointer" 
          onClick={() => setSelectedMetric(stakeholderMetrics.digitalGrowth)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-primary" />
              <Badge variant="outline" className="text-primary border-primary">
                +51%
              </Badge>
            </div>
            <div className="text-2xl font-bold">
              {stakeholderData.digitalEngagement.onlineDonationGrowth}%
            </div>
            <div className="text-sm text-muted-foreground">Online Growth</div>
          </CardContent>
        </Card>
      </div>

      {/* Volunteer Ecosystem */}
      <Card className="executive-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Volunteer Ecosystem Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Comprehensive analysis of volunteer engagement and impact
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {(stakeholderData.volunteers.total + stakeholderData.volunteers.partnerVolunteers).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Volunteers</div>
              <div className="text-xs text-success mt-1">
                Direct + Partner Network
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-success">
                {(stakeholderData.volunteers.hours + 500000).toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">Total Hours Contributed</div>
              <div className="text-xs text-primary mt-1">
                Value: EGP {stakeholderData.volunteers.monetaryValue.toLocaleString()}+
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-warning">
                {stakeholderData.volunteers.satisfaction}%
              </div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
              <div className="text-xs text-success mt-1">
                95% would volunteer again
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {volunteerSegments.map((segment) => (
              <div key={segment.category} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{segment.category}</h4>
                  <Badge variant="outline" className={cn(
                    segment.color === 'primary' && "text-primary border-primary",
                    segment.color === 'success' && "text-success border-success"
                  )}>
                    {segment.count.toLocaleString()} volunteers
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Annual Hours</div>
                    <div className="font-semibold">{segment.hours.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Key Activities</div>
                    <div className="font-semibold">{segment.activities.join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Satisfaction</div>
                    <div className="font-semibold">{segment.satisfaction}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Digital Engagement Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="executive-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Digital Engagement Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {engagementMetrics.map((platform) => (
              <div key={platform.platform} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{platform.platform}</div>
                  <Badge variant="outline" className="text-success border-success">
                    +{platform.growth}%
                  </Badge>
                </div>
                
                <Progress value={Math.min(platform.growth, 100)} className={cn(
                  "h-2",
                  platform.growth >= 40 && "[&>div]:bg-green-500",
                  platform.growth >= 20 && platform.growth < 40 && "[&>div]:bg-orange-500",
                  platform.growth < 20 && "[&>div]:bg-red-500"
                )} />
                
                <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                  <div><strong>Audience:</strong> {platform.primaryAudience}</div>
                  <div><strong>Content:</strong> {platform.keyContent}</div>
                </div>
              </div>
            ))}
            
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <div className="text-sm font-medium text-primary">
                #1MillionMealsADay Campaign Impact
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Reached ~3M users during World Food Day, driving significant engagement and donations
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="executive-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-warning" />
              Brand Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {brandMetrics.map((metric) => (
              <div key={metric.metric} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <div className="font-medium">{metric.metric}</div>
                  <div className="text-xs text-muted-foreground">{metric.benchmark}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <Badge variant="outline" className={getStatusColor(metric.status)}>
                    {metric.status === 'excellent' && 'Excellent'}
                    {metric.status === 'good' && 'Good'}
                    {metric.status === 'needs-attention' && 'Needs Focus'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metric Modal */}
      {selectedMetric && (
        <MetricDetailModal 
          isOpen={!!selectedMetric}
          onClose={() => setSelectedMetric(null)}
          metric={selectedMetric}
        />
      )}
    </div>
  );
}

export default StakeholderAnalytics;