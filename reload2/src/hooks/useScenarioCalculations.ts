import { useMemo } from 'react';

interface DashboardMetrics {
  mealsDelivered: number;
  peopleServed: number;
  costPerMeal: number;
  programEfficiency: number;
  revenue: number;
  expenses: number;
  reserves: number;
  cashPosition: number;
}

interface ScenarioFactors {
  economicGrowth: number;
  inflationRate: number;
  donorSentiment: number;
  operationalEfficiency: number;
  foodPrices: number;
  unemploymentRate: number;
  corporateCSR: number;
  governmentSupport: number;
  exchangeRateEGP: number;
  logisticsCostIndex: number;
  regionalShock: number;
}

export function useScenarioCalculations(
  baseMetrics: DashboardMetrics,
  scenarioFactors: ScenarioFactors
) {
  return useMemo(() => {
    // Enhanced econometric model with comprehensive cross-correlations
    // All variables now affect all outputs through multiple pathways
    
    // Economic factors - affect revenue, demand, and costs
    const economicMultiplier = 1 + (scenarioFactors.economicGrowth * 0.05); // Increased impact
    const inflationImpact = 1 + (scenarioFactors.inflationRate * 0.04); // Increased impact
    const unemploymentEffect = 1 + (scenarioFactors.unemploymentRate * 0.025); // Increased impact
    
    // Social factors - affect revenue and demand
    const donorConfidence = 1 + (scenarioFactors.donorSentiment * 0.06); // Increased impact
    const csrEngagement = 1 + (scenarioFactors.corporateCSR * 0.04); // Increased impact
    
    // Operational factors - affect costs, efficiency, and capacity
    const efficiencyGains = 1 + (scenarioFactors.operationalEfficiency * 0.03); // Increased impact
    const foodCostImpact = 1 + (scenarioFactors.foodPrices * 0.05); // Increased impact
    const logisticsCostImpact = 1 + (scenarioFactors.logisticsCostIndex * 0.015); // Increased impact
    
    // Institutional factors - affect revenue and costs
    const govSupport = 1 + (scenarioFactors.governmentSupport * 0.03); // Increased impact
    
    // External factors - affect all variables through multiple pathways
    const fxAdjust = 1 + (scenarioFactors.exchangeRateEGP * -0.008); // Increased impact on real donation power
    const shockAdjust = 1 + (scenarioFactors.regionalShock * 0.25); // Increased demand surge during regional shocks
    
    // Enhanced cross-correlation effects - ALL variables affect ALL others
    const crossCorrelationMultiplier = 1 + (
      // Economic factors affecting all others
      (scenarioFactors.economicGrowth * 0.015) + // Economic growth affects donor confidence, efficiency, government support
      (scenarioFactors.inflationRate * 0.008) + // Inflation affects donor sentiment, operational efficiency
      (scenarioFactors.unemploymentRate * 0.012) + // Unemployment affects donor confidence, government support
      
      // Social factors affecting all others
      (scenarioFactors.donorSentiment * 0.01) + // Donor sentiment affects operational efficiency, government support
      (scenarioFactors.corporateCSR * 0.008) + // Corporate CSR affects donor sentiment, government support
      
      // Operational factors affecting all others
      (scenarioFactors.operationalEfficiency * 0.012) + // Efficiency affects donor confidence, government support
      (scenarioFactors.foodPrices * 0.006) + // Food prices affect donor sentiment, government support
      (scenarioFactors.logisticsCostIndex * 0.004) + // Logistics costs affect operational efficiency
      
      // Institutional factors affecting all others
      (scenarioFactors.governmentSupport * 0.008) + // Government support affects all factors
      
      // External factors affecting all others
      (scenarioFactors.exchangeRateEGP * 0.003) + // FX affects donor confidence, operational efficiency
      (scenarioFactors.regionalShock * 0.02) // Regional shocks affect all factors
    );

    // Revenue projections with ALL variables affecting revenue
    const revenueProjection = baseMetrics.revenue * 
      economicMultiplier * // Economic growth
      donorConfidence * // Donor sentiment
      csrEngagement * // Corporate CSR
      govSupport * // Government support
      fxAdjust * // Exchange rate impact
      crossCorrelationMultiplier * // Cross-correlation effects from ALL variables
      (2 - unemploymentEffect * 0.7) * // Unemployment (inverse relationship)
      (1 + scenarioFactors.foodPrices * 0.01) * // Food prices affect donations
      (1 + scenarioFactors.operationalEfficiency * 0.01) * // Efficiency affects donor confidence
      (1 + scenarioFactors.logisticsCostIndex * 0.005) * // Logistics costs affect operations
      shockAdjust; // Regional shock impact

    // Cost projections with ALL variables affecting costs
    const costProjection = baseMetrics.expenses * 
      inflationImpact * // Inflation rate
      foodCostImpact * // Food prices
      logisticsCostImpact * // Logistics costs
      crossCorrelationMultiplier * // Cross-correlation effects from ALL variables
      (2 - efficiencyGains) * // Efficiency reduces costs
      (1 + scenarioFactors.unemploymentRate * 0.01) * // Unemployment affects labor costs
      (1 + scenarioFactors.donorSentiment * 0.005) * // Donor sentiment affects operational costs
      (1 + scenarioFactors.corporateCSR * 0.003) * // Corporate CSR affects partnership costs
      (1 + scenarioFactors.governmentSupport * 0.002) * // Government support affects compliance costs
      (1 + scenarioFactors.exchangeRateEGP * 0.01) * // FX affects import costs
      shockAdjust; // Regional shock impact

    // Advanced impact modeling with comprehensive cross-correlations
    const efficiencyBonus = Math.min(scenarioFactors.operationalEfficiency * 2, 20); // Cap at 20%
    const demandIncrease = Math.max(scenarioFactors.unemploymentRate * 1.5, 0);
    
    // ALL variables affect people served through multiple pathways
    const projectedPeopleServed = Math.round(
      baseMetrics.peopleServed * 
      (1 + demandIncrease * 0.01) * // Unemployment increases demand
      economicMultiplier * // Economic growth affects reach
      donorConfidence * // Donor sentiment affects capacity
      crossCorrelationMultiplier * // Cross-correlation effects from ALL variables
      shockAdjust * // Regional shock impact
      (1 + scenarioFactors.governmentSupport * 0.01) * // Government support affects reach
      (1 + scenarioFactors.corporateCSR * 0.005) * // Corporate CSR affects community reach
      (1 + scenarioFactors.operationalEfficiency * 0.008) * // Efficiency affects capacity
      (1 + scenarioFactors.foodPrices * 0.003) * // Food prices affect demand
      (1 + scenarioFactors.logisticsCostIndex * 0.002) * // Logistics affects reach
      (1 + scenarioFactors.exchangeRateEGP * 0.001) * // FX affects operations
      (1 + scenarioFactors.inflationRate * 0.002) // Inflation affects demand
    );

    // ALL variables affect cost per meal through multiple pathways
    const projectedCostPerMeal = 
      baseMetrics.costPerMeal * 
      inflationImpact * // Inflation rate
      foodCostImpact * // Food prices
      logisticsCostImpact * // Logistics costs
      crossCorrelationMultiplier * // Cross-correlation effects from ALL variables
      (2 - efficiencyGains) * // Efficiency reduces costs
      (1 + scenarioFactors.exchangeRateEGP * 0.002) * // FX affects import costs
      (1 + scenarioFactors.regionalShock * 0.05) * // Regional shocks increase costs
      (1 + scenarioFactors.unemploymentRate * 0.003) * // Unemployment affects labor costs
      (1 + scenarioFactors.donorSentiment * 0.001) * // Donor sentiment affects operational costs
      (1 + scenarioFactors.corporateCSR * 0.001) * // Corporate CSR affects partnership costs
      (1 + scenarioFactors.governmentSupport * 0.001) * // Government support affects compliance costs
      (1 + scenarioFactors.economicGrowth * 0.002); // Economic growth affects supply costs

    // Calculate meals delivered with funding envelope constraint
    const maxMealsFromFunding = Math.round(
      (revenueProjection + (baseMetrics.reserves * 0.3)) / projectedCostPerMeal
    );
    
    // ALL variables affect meals delivered through multiple pathways
    const projectedMealsDelivered = Math.min(
      Math.round(
        baseMetrics.mealsDelivered * 
        (1 + demandIncrease * 0.01) * // Unemployment increases demand
        economicMultiplier * // Economic growth affects capacity
        donorConfidence * // Donor sentiment affects capacity
        efficiencyGains * // Operational efficiency affects capacity
        crossCorrelationMultiplier * // Cross-correlation effects from ALL variables
        shockAdjust * // Regional shock impact
        (1 + scenarioFactors.governmentSupport * 0.01) * // Government support affects capacity
        (1 + scenarioFactors.corporateCSR * 0.005) * // Corporate CSR affects capacity
        (1 + scenarioFactors.foodPrices * 0.003) * // Food prices affect demand
        (1 + scenarioFactors.logisticsCostIndex * 0.002) * // Logistics affects capacity
        (1 + scenarioFactors.exchangeRateEGP * 0.001) * // FX affects operations
        (1 + scenarioFactors.inflationRate * 0.002) * // Inflation affects demand
        (1 + scenarioFactors.unemploymentRate * 0.008) // Unemployment affects demand
      ),
      maxMealsFromFunding // Cap by funding envelope
    );

    // Program efficiency affected by ALL variables
    const projectedEfficiency = Math.min(
      Math.max(
        baseMetrics.programEfficiency + 
        efficiencyBonus - // Operational efficiency bonus
        (scenarioFactors.inflationRate * 0.5) + // Inflation reduces efficiency
        (scenarioFactors.operationalEfficiency * 0.8) + // Operational efficiency improves program efficiency
        (scenarioFactors.governmentSupport * 0.3) + // Government support improves efficiency
        (scenarioFactors.donorSentiment * 0.1) + // Donor confidence improves efficiency
        (scenarioFactors.corporateCSR * 0.2) + // Corporate CSR improves efficiency
        (scenarioFactors.economicGrowth * 0.1) + // Economic growth improves efficiency
        (scenarioFactors.foodPrices * 0.05) - // Food price volatility reduces efficiency
        (scenarioFactors.logisticsCostIndex * 0.1) - // Logistics costs reduce efficiency
        (scenarioFactors.unemploymentRate * 0.2) - // Unemployment reduces efficiency
        (scenarioFactors.regionalShock * 2) - // Regional shocks reduce efficiency
        (scenarioFactors.exchangeRateEGP * 0.1), // FX volatility reduces efficiency
        60
      ),
      95
    );

    // Financial projections with ALL variables affecting reserves and cash
    const netCashFlow = revenueProjection - costProjection;
    const reserveAdjustment = 1 + (
      (scenarioFactors.governmentSupport * 0.02) + // Government support improves reserves
      (scenarioFactors.donorSentiment * 0.01) + // Donor confidence improves reserves
      (scenarioFactors.corporateCSR * 0.015) + // Corporate CSR improves reserves
      (scenarioFactors.economicGrowth * 0.008) + // Economic growth improves reserves
      (scenarioFactors.operationalEfficiency * 0.005) + // Efficiency improves reserves
      (scenarioFactors.foodPrices * 0.002) - // Food price volatility reduces reserves
      (scenarioFactors.logisticsCostIndex * 0.003) - // Logistics costs reduce reserves
      (scenarioFactors.unemploymentRate * 0.004) - // Unemployment reduces reserves
      (scenarioFactors.regionalShock * 0.1) - // Regional shocks reduce reserves
      (scenarioFactors.exchangeRateEGP * 0.05) - // FX volatility reduces reserves
      (scenarioFactors.inflationRate * 0.01) // Inflation reduces reserves
    );
    
    const projectedReserves = Math.max(
      baseMetrics.reserves + (netCashFlow * 0.3 * reserveAdjustment),
      baseMetrics.reserves * 0.5
    );

    const cashAdjustment = 1 + (
      (scenarioFactors.operationalEfficiency * 0.01) + // Efficiency improves cash flow
      (scenarioFactors.governmentSupport * 0.01) + // Government support improves cash
      (scenarioFactors.donorSentiment * 0.005) + // Donor confidence improves cash
      (scenarioFactors.corporateCSR * 0.008) + // Corporate CSR improves cash
      (scenarioFactors.economicGrowth * 0.004) + // Economic growth improves cash
      (scenarioFactors.foodPrices * 0.001) - // Food price volatility affects cash
      (scenarioFactors.logisticsCostIndex * 0.002) - // Logistics costs affect cash
      (scenarioFactors.unemploymentRate * 0.002) - // Unemployment affects cash
      (scenarioFactors.regionalShock * 0.05) - // Regional shocks reduce cash
      (scenarioFactors.exchangeRateEGP * 0.02) - // FX volatility affects cash
      (scenarioFactors.inflationRate * 0.005) // Inflation affects cash
    );
    
    const projectedCashPosition = Math.max(
      baseMetrics.cashPosition + (netCashFlow * 0.15 * cashAdjustment),
      baseMetrics.cashPosition * 0.3
    );

    // Impact summary calculations with comprehensive cross-correlations
    const revenueChange = ((revenueProjection - baseMetrics.revenue) / baseMetrics.revenue) * 100;
    const demandChange = ((projectedPeopleServed - baseMetrics.peopleServed) / baseMetrics.peopleServed) * 100;
    const costChange = ((projectedCostPerMeal - baseMetrics.costPerMeal) / baseMetrics.costPerMeal) * 100;
    const efficiencyChange = projectedEfficiency - baseMetrics.programEfficiency;
    
    // Additional impact metrics showing cross-correlation effects
    const reserveChange = ((projectedReserves - baseMetrics.reserves) / baseMetrics.reserves) * 100;
    const cashChange = ((projectedCashPosition - baseMetrics.cashPosition) / baseMetrics.cashPosition) * 100;
    const mealsChange = ((projectedMealsDelivered - baseMetrics.mealsDelivered) / baseMetrics.mealsDelivered) * 100;

    return {
      mealsDelivered: projectedMealsDelivered,
      peopleServed: projectedPeopleServed,
      costPerMeal: projectedCostPerMeal,
      programEfficiency: projectedEfficiency,
      revenue: revenueProjection,
      expenses: costProjection,
      reserves: projectedReserves,
      cashPosition: projectedCashPosition,
      // Impact summary for display
      revenueChange,
      demandChange,
      costChange,
      efficiencyChange,
      reserveChange,
      cashChange,
      mealsChange,
    };
  }, [baseMetrics, scenarioFactors]);
}