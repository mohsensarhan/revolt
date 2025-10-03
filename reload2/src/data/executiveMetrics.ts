import { formatSimpleNumber } from '@/lib/formatters';

export interface ExecutiveMetricData {
  title: string;
  value: string;
  description: string;
  methodology: string;
  dataSource: string;
  interpretation: string;
  significance: string;
  benchmarks: string[];
  recommendations: string[];
}

interface Metrics {
  peopleServed: number;
  mealsDelivered: number;
  costPerMeal: number;
  programEfficiency: number;
}

export const createExecutiveMetrics = (metrics: Metrics): Record<string, ExecutiveMetricData> => ({
  livesImpacted: {
    title: "Lives Impacted Analysis",
    value: `${formatSimpleNumber(metrics.peopleServed)} people`,
    description: "4.96 million unique individuals reached nationwide across all 27 governorates",
    methodology: "Unique beneficiary identification using national ID verification system, preventing double-counting across multiple programs and time periods.",
    dataSource: "National Beneficiary Database + Ministry of Social Solidarity Integration",
    interpretation: "4.96M represents 4.8% of Egypt's total population, focusing on most vulnerable households identified through poverty mapping",
    significance: "Largest humanitarian reach in Egypt's history, exceeding government social protection programs in coverage and efficiency",
    benchmarks: [
      "UN WFP Egypt: 2.1M beneficiaries",
      "Government Takaful Program: 3.2M households",
      "Regional average coverage: 2.3% population"
    ],
    recommendations: [
      "Target 6M beneficiaries by 2025 through geographic expansion",
      "Develop digital identity system for rural populations",
      "Expand prevention programs to reduce future emergency needs"
    ]
  },
  mealsDelivered: {
    title: "Meals Delivered Impact Assessment", 
    value: `${formatSimpleNumber(metrics.mealsDelivered)} meals`,
    description: "Total annual food assistance across protection, prevention, and empowerment programs",
    methodology: "Comprehensive meal equivalent calculation using WHO nutritional standards, verified through biometric distribution tracking and partner reporting.",
    dataSource: "Distribution Management System + Partner Network Reports + Field Verification",
    interpretation: "367.5M meals represents 72 meals per beneficiary annually, equivalent to providing complete nutrition for 1 million people daily",
    significance: "Largest food distribution operation in MENA region, preventing acute malnutrition crisis during economic downturn",
    benchmarks: [
      "Food Banks Canada: 180M meals annually",
      "Feeding America: 6.6B meals annually",
      "European Food Banks: 760M meals annually"
    ],
    recommendations: [
      "Scale to 500M meals by 2026 through supply chain optimization",
      "Increase fresh produce distribution from 15% to 30%",
      "Develop regional food hubs to reduce distribution costs"
    ]
  },
  costEfficiency: {
    title: "Cost Per Meal Optimization",
    value: `EGP ${metrics.costPerMeal.toFixed(2)} per meal`,
    description: "Industry-leading cost efficiency through supply chain innovation and operational excellence",
    methodology: "Total program costs divided by verified meal equivalents, including procurement, logistics, distribution, and quality assurance overhead.",
    dataSource: "Financial Management System + Supply Chain Analytics + External Benchmarking Studies",
    interpretation: "EGP 6.36 represents 40% cost reduction versus international humanitarian standards, enabling maximum impact per donated pound",
    significance: "Sets global benchmark for humanitarian cost efficiency, demonstrating Egyptian innovation in food security solutions",
    benchmarks: [
      "USAID humanitarian meals: $3.12 (EGP 153)",
      "UN WFP regional average: $2.85 (EGP 140)", 
      "European food banks: €1.90 (EGP 95)"
    ],
    recommendations: [
      "Target EGP 5.50 per meal through bulk procurement",
      "Invest in automated packaging to reduce labor costs",
      "Develop local supplier network to eliminate import dependencies"
    ]
  },
  programEfficiency: {
    title: "Program Efficiency Excellence",
    value: `${metrics.programEfficiency.toFixed(1)}%`,
    description: "Exceptional operational efficiency ensuring maximum resources reach beneficiaries",
    methodology: "Program expenses as percentage of total expenses, excluding necessary fundraising and minimal administrative costs, calculated using international humanitarian accounting standards.",
    dataSource: "Audited Financial Statements + Program Cost Allocation System + Independent Efficiency Assessment",
    interpretation: "83% efficiency exceeds international humanitarian standards by 18 percentage points, demonstrating exceptional stewardship of donor resources",
    significance: "Top quartile global performance among humanitarian organizations, establishing EFB as model for operational excellence in food security",
    benchmarks: [
      "Charity Navigator 4-star threshold: 75%",
      "UN WFP operational efficiency: 78%",
      "International humanitarian average: 65%"
    ],
    recommendations: [
      "Maintain 85%+ efficiency through digital transformation",
      "Implement AI-driven demand forecasting to reduce waste",
      "Develop volunteer network to expand capacity without overhead growth"
    ]
  }
});