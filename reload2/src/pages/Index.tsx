import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Globe, Target, TrendingUp, Clock } from "lucide-react";
import efbLogo from '@/assets/efb-logo.png';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 xl:p-12">
      <div className="w-full max-w-7xl text-center space-y-6 sm:space-y-8 lg:space-y-12 xl:space-y-16">
        {/* Logo and Header */}
        <div className="flex flex-col items-center gap-4 sm:gap-6 lg:gap-8">
          <img src={efbLogo} alt="EFB Logo" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-32 xl:h-32 animate-fade-in" />
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold leading-tight">
              Humanitarian Impact
              <span className="text-primary ml-2 block sm:inline">Intelligence Center</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-muted-foreground max-w-full sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto leading-relaxed px-4">
              Real-time analytics and strategic intelligence for Egypt's largest humanitarian operation.
              <strong className="text-primary"> Global #3</strong> food bank serving <strong className="text-primary">4.96 million lives</strong> through evidence-based programming.
            </p>
          </div>
        </div>

        {/* Impact Story - Visual Flow */}
        <Card className="bg-gradient-to-br from-primary/10 via-success/5 to-warning/10 border-primary/20 p-6 sm:p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="p-4 rounded-full bg-primary/20">
                  <Target className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">The Challenge</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Egypt faces unprecedented food security crisis with 60% population food insecure amid economic turbulence
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="p-4 rounded-full bg-success/20">
                  <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-success" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">Our Response</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                367.5M meals delivered at world-class efficiency through 27/27 governorate coverage reaching every corner
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="p-4 rounded-full bg-warning/20">
                  <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-warning" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">The Impact</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                86% reduction in child stunting, 43% annual growth rate, achieving global humanitarian excellence
              </p>
            </div>
          </div>
        </Card>

        {/* Journey Timeline */}
        <div className="bg-muted/30 rounded-lg p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Our Journey to Global Excellence</h3>
          </div>
          <div className="flex items-center justify-center gap-3 text-xs sm:text-sm text-muted-foreground max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="text-lg sm:text-xl font-bold text-primary">2006</div>
              <div className="text-center">Founded</div>
            </div>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-muted via-primary/50 to-muted"></div>
            <div className="flex flex-col items-center">
              <div className="text-lg sm:text-xl font-bold text-success">2020</div>
              <div className="text-center">Regional Leader</div>
            </div>
            <div className="flex-1 h-0.5 bg-gradient-to-r from-muted via-success/50 to-muted"></div>
            <div className="flex flex-col items-center">
              <div className="text-lg sm:text-xl font-bold text-warning">2024</div>
              <div className="text-center">Global #3</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 w-full">
          <Link to="/dashboard">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-2 sm:py-3 md:py-4 lg:py-6 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
              Explore Impact Intelligence
            </Button>
          </Link>

          <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 xl:gap-6 flex-wrap w-full">
            <Badge variant="outline" className="text-success border-success text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1 sm:py-2 hover:bg-success/10 transition-colors">
              Real-time Indicators
            </Badge>
            <Badge variant="outline" className="text-primary border-primary text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1 sm:py-2 hover:bg-primary/10 transition-colors">
              Scenario Modeling
            </Badge>
            <Badge variant="outline" className="text-warning border-warning text-xs sm:text-sm px-2 sm:px-3 md:px-4 py-1 sm:py-2 hover:bg-warning/10 transition-colors">
              Evidence-Based Insights
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
