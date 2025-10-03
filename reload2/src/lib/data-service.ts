import { supabase, supabaseAdmin } from './supabase';

export interface ScenarioFactors {
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

export interface ChartData {
  revenueChange: number;
  demandChange: number;
  costChange: number;
  efficiencyChange: number;
  reserveChange: number;
  cashChange: number;
  mealsChange: number;
}

export interface GlobalIndicators {
  egyptInflation: number;
  egyptCurrency: number;
  egyptFoodInsecurity: number;
  globalInflation: number;
  globalFoodPrices: number;
  emergingMarketRisk: number;
}

export interface ExecutiveMetrics {
  id?: number;
  created_at?: string;
  updated_at?: string;
  meals_delivered: number;
  people_served: number;
  cost_per_meal: number;
  program_efficiency: number;
  revenue: number;
  expenses: number;
  reserves: number;
  cash_position: number;
  coverage_governorates: number;
  scenario_factors?: ScenarioFactors;
  chartData?: ChartData;
  globalIndicators?: GlobalIndicators;
  revenueChange?: number;
  demandChange?: number;
  costChange?: number;
  efficiencyChange?: number;
  reserveChange?: number;
  cashChange?: number;
  mealsChange?: number;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'viewer' | 'editor';
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface AuditLog {
  id?: number;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_data?: any;
  new_data?: any;
  created_at: string;
}

export interface Scenario {
  id?: number;
  created_at?: string;
  updated_at?: string;
  name: string;
  description?: string;
  factors: Record<string, number>;
  results?: Record<string, any>;
  created_by?: string;
  is_active?: boolean;
}


const DEFAULT_SCENARIO_FACTORS: ScenarioFactors = {
  economicGrowth: 0,
  inflationRate: 0,
  donorSentiment: 0,
  operationalEfficiency: 0,
  foodPrices: 0,
  unemploymentRate: 0,
  corporateCSR: 0,
  governmentSupport: 0,
  exchangeRateEGP: 0,
  logisticsCostIndex: 0,
  regionalShock: 0,
};

const DEFAULT_CHART_DATA: ChartData = {
  revenueChange: 0,
  demandChange: 0,
  costChange: 0,
  efficiencyChange: 0,
  reserveChange: 0,
  cashChange: 0,
  mealsChange: 0,
};

const DEFAULT_GLOBAL_INDICATORS: GlobalIndicators = {
  egyptInflation: 35.7,
  egyptCurrency: 47.5,
  egyptFoodInsecurity: 17.2,
  globalInflation: 6.8,
  globalFoodPrices: 23.4,
  emergingMarketRisk: 72.3,
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const mergeScenarioFactors = (
  source: Partial<ScenarioFactors> | null | undefined,
  fallback: ScenarioFactors = DEFAULT_SCENARIO_FACTORS
): ScenarioFactors => ({
  economicGrowth: toNumber(source?.economicGrowth, fallback.economicGrowth),
  inflationRate: toNumber(source?.inflationRate, fallback.inflationRate),
  donorSentiment: toNumber(source?.donorSentiment, fallback.donorSentiment),
  operationalEfficiency: toNumber(source?.operationalEfficiency, fallback.operationalEfficiency),
  foodPrices: toNumber(source?.foodPrices, fallback.foodPrices),
  unemploymentRate: toNumber(source?.unemploymentRate, fallback.unemploymentRate),
  corporateCSR: toNumber(source?.corporateCSR, fallback.corporateCSR),
  governmentSupport: toNumber(source?.governmentSupport, fallback.governmentSupport),
  exchangeRateEGP: toNumber(source?.exchangeRateEGP, fallback.exchangeRateEGP),
  logisticsCostIndex: toNumber(source?.logisticsCostIndex, fallback.logisticsCostIndex),
  regionalShock: toNumber(source?.regionalShock, fallback.regionalShock),
});

const mergeChartData = (
  source: Partial<ChartData> | null | undefined,
  fallback: ChartData = DEFAULT_CHART_DATA
): ChartData => ({
  revenueChange: toNumber(source?.revenueChange, fallback.revenueChange),
  demandChange: toNumber(source?.demandChange, fallback.demandChange),
  costChange: toNumber(source?.costChange, fallback.costChange),
  efficiencyChange: toNumber(source?.efficiencyChange, fallback.efficiencyChange),
  reserveChange: toNumber(source?.reserveChange, fallback.reserveChange),
  cashChange: toNumber(source?.cashChange, fallback.cashChange),
  mealsChange: toNumber(source?.mealsChange, fallback.mealsChange),
});

const mergeGlobalIndicators = (
  source: Partial<GlobalIndicators> | null | undefined,
  fallback: GlobalIndicators = DEFAULT_GLOBAL_INDICATORS
): GlobalIndicators => ({
  egyptInflation: toNumber(source?.egyptInflation, fallback.egyptInflation),
  egyptCurrency: toNumber(source?.egyptCurrency, fallback.egyptCurrency),
  egyptFoodInsecurity: toNumber(source?.egyptFoodInsecurity, fallback.egyptFoodInsecurity),
  globalInflation: toNumber(source?.globalInflation, fallback.globalInflation),
  globalFoodPrices: toNumber(source?.globalFoodPrices, fallback.globalFoodPrices),
  emergingMarketRisk: toNumber(source?.emergingMarketRisk, fallback.emergingMarketRisk),
});

const buildScenarioPayload = (
  scenarioFactors: ScenarioFactors,
  chartData: ChartData,
  globalIndicators: GlobalIndicators
): Record<string, unknown> => ({
  scenarioFactors,
  chartData,
  globalIndicators,
});

const normalizeExecutiveMetrics = (row: any | null): ExecutiveMetrics | null => {
  if (!row) {
    return null;
  }

  const rawPayload = (row.scenario_factors ?? {}) as Record<string, any>;
  const scenarioSection = rawPayload.scenarioFactors ?? rawPayload;
  const chartSection = rawPayload.chartData ?? {
    revenueChange: row.revenueChange,
    demandChange: row.demandChange,
    costChange: row.costChange,
    efficiencyChange: row.efficiencyChange,
    reserveChange: row.reserveChange,
    cashChange: row.cashChange,
    mealsChange: row.mealsChange,
  };
  const globalSection = rawPayload.globalIndicators ?? row.globalIndicators;

  const scenario_factors = mergeScenarioFactors(scenarioSection);
  const chartData = mergeChartData(chartSection);
  const globalIndicators = mergeGlobalIndicators(globalSection);

  return {
    ...row,
    scenario_factors,
    chartData,
    globalIndicators,
    revenueChange: chartData.revenueChange,
    demandChange: chartData.demandChange,
    costChange: chartData.costChange,
    efficiencyChange: chartData.efficiencyChange,
    reserveChange: chartData.reserveChange,
    cashChange: chartData.cashChange,
    mealsChange: chartData.mealsChange,
  };
};


class DataService {
  // Executive Metrics Operations
  async getExecutiveMetrics(): Promise<ExecutiveMetrics | null> {
    try {
      const { data, error } = await supabase
        .from('executive_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching executive metrics:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error fetching executive metrics:', error);
      return null;
    }
  }

  async updateExecutiveMetrics(metrics: Partial<ExecutiveMetrics>): Promise<ExecutiveMetrics | null> {
    try {
      const currentMetrics = await this.getExecutiveMetrics();

      const allowedKeys: Array<keyof ExecutiveMetrics> = [
        'id',
        'created_at',
        'updated_at',
        'meals_delivered',
        'people_served',
        'cost_per_meal',
        'program_efficiency',
        'revenue',
        'expenses',
        'reserves',
        'cash_position',
        'coverage_governorates',
      ];

      const sanitized: Record<string, unknown> = {};

      for (const key of allowedKeys) {
        const value = (metrics as Record<string, unknown>)[key as string];
        if (value !== undefined && value !== null) {
          sanitized[key as string] = value;
        }
      }

      if (!('id' in sanitized) && currentMetrics?.id !== undefined) {
        sanitized.id = currentMetrics.id;
      }

      if (!('created_at' in sanitized) && currentMetrics?.created_at) {
        sanitized.created_at = currentMetrics.created_at;
      }

      if (!('updated_at' in sanitized) && currentMetrics?.updated_at) {
        sanitized.updated_at = currentMetrics.updated_at;
      }

      const incomingScenario =
        (metrics.scenario_factors as Partial<ScenarioFactors> | undefined) ||
        (metrics as any).scenarioFactors;

      const scenarioFactors = mergeScenarioFactors(
        incomingScenario,
        currentMetrics?.scenario_factors ?? DEFAULT_SCENARIO_FACTORS
      );

      const chartData = mergeChartData(
        {
          ...(metrics as any).chartData,
          revenueChange: (metrics as any).revenueChange,
          demandChange: (metrics as any).demandChange,
          costChange: (metrics as any).costChange,
          efficiencyChange: (metrics as any).efficiencyChange,
          reserveChange: (metrics as any).reserveChange,
          cashChange: (metrics as any).cashChange,
          mealsChange: (metrics as any).mealsChange,
        },
        currentMetrics?.chartData ?? DEFAULT_CHART_DATA
      );

      const globalIndicators = mergeGlobalIndicators(
        (metrics as any).globalIndicators,
        currentMetrics?.globalIndicators ?? DEFAULT_GLOBAL_INDICATORS
      );

      sanitized.scenario_factors = buildScenarioPayload(scenarioFactors, chartData, globalIndicators);

      const { data, error } = await supabaseAdmin
        .from('executive_metrics')
        .upsert([sanitized])
        .select()
        .single();

      if (error) {
        console.error('Error updating executive metrics:', error);
        return null;
      }

      const normalized = normalizeExecutiveMetrics(data);

      await this.logAudit(
        'update',
        'executive_metrics',
        (normalized?.id ?? sanitized.id ?? '1').toString(),
        currentMetrics,
        normalized ?? { ...sanitized, scenario_factors: scenarioFactors }
      );

      return normalized;
    } catch (error) {
      console.error('Unexpected error updating executive metrics:', error);
      return null;
    }
  }

  // Real-time subscription for executive metrics
  subscribeToExecutiveMetrics(callback: (metrics: ExecutiveMetrics) => void) {
    const subscription = supabase
      .channel('executive_metrics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'executive_metrics'
        },
        (payload) => {
          console.log('Executive metrics changed:', payload);
          if (payload.new) {
            const normalized = normalizeExecutiveMetrics(payload.new);
            if (normalized) {
              callback(normalized);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  // User Operations
  async getUsers(): Promise<User[]> {
    try {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('users')
        .select('id,email,role')
        .order('email', { ascending: true });

      if (error) {
        const coded = error as { code?: string };
        if (coded?.code === '42703') {
          console.warn('users table missing expected columns; returning empty list');
          return [];
        }

        console.error('Error fetching users:', error);
        return [];
      }

      return (data || []).map((user) => ({
        id: user.id,
        email: user.email,
        role: (user.role as User['role']) || 'viewer',
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || new Date().toISOString(),
        last_login: undefined,
      }));
    } catch (error) {
      console.error('Unexpected error fetching users:', error);
      return [];
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return null;
      }

      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('users')
        .select('id,email,role')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        const coded = error as { code?: string };
        if (coded?.code === 'PGRST116' || coded?.code === '406') {
          console.warn('User metadata not found in users table; falling back to auth payload');
        } else {
          console.error('Error fetching user data:', error);
        }

        return {
          id: user.id,
          email: user.email || '',
          role: 'admin',
          created_at: user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      if (!data) {
        return {
          id: user.id,
          email: user.email || '',
          role: 'admin',
          created_at: user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      return {
        id: data.id,
        email: data.email,
        role: (data.role as User['role']) || 'viewer',
        created_at: data.created_at || user.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
        last_login: undefined,
      };
    } catch (error) {
      console.error('Unexpected error fetching current user:', error);
      return null;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>, temporaryPassword: string): Promise<User | null> {
    try {
      // SECURITY: Validate password strength
      if (!temporaryPassword || temporaryPassword.length < 12) {
        console.error('Password must be at least 12 characters');
        return null;
      }

      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: temporaryPassword // Caller must provide a strong temporary password
      });

      if (authError || !user) {
        console.error('Error creating auth user:', authError);
        return null;
      }

      const { data, error } = await supabaseAdmin
        .from('users')
        .insert([{
          id: user.id,
          email: userData.email,
          role: userData.role
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating user record:', error);
        return null;
      }

      await this.logAudit('create', 'users', data.id, null, data);
      return data;
    } catch (error) {
      console.error('Unexpected error creating user:', error);
      return null;
    }
  }

  async updateUserRole(userId: string, role: 'admin' | 'viewer' | 'editor'): Promise<User | null> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can update user roles');
      }

      const { data: oldData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await supabaseAdmin
        .from('users')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user role:', error);
        return null;
      }

      await this.logAudit('update', 'users', userId, oldData, data);
      return data;
    } catch (error) {
      console.error('Unexpected error updating user role:', error);
      return null;
    }
  }

  // Authentication
  async signIn(email: string, password: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Error signing in:', error);
        return null;
      }

      // Update last login
      if (data.user) {
        await supabaseAdmin
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id);
      }

      return await this.getCurrentUser();
    } catch (error) {
      console.error('Unexpected error signing in:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  // Audit Log Operations
  async logAudit(action: string, table_name: string, record_id: string, old_data?: any, new_data?: any): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return;

      await supabaseAdmin
        .from('audit_logs')
        .insert([{
          user_id: user.id,
          action,
          table_name,
          record_id,
          old_data,
          new_data
        }]);
    } catch (error) {
      console.error('Error logging audit:', error);
    }
  }

  async getAuditLogs(limit: number = 50): Promise<AuditLog[]> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching audit logs:', error);
      return [];
    }
  }

  // Scenario Operations
  async getScenarios(): Promise<Scenario[]> {
    try {
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching scenarios:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching scenarios:', error);
      return [];
    }
  }

  async createScenario(scenario: Omit<Scenario, 'id' | 'created_at' | 'updated_at'>): Promise<Scenario | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('scenarios')
        .insert([{
          ...scenario,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating scenario:', error);
        return null;
      }

      await this.logAudit('create', 'scenarios', data.id?.toString() || '', null, data);
      return data;
    } catch (error) {
      console.error('Unexpected error creating scenario:', error);
      return null;
    }
  }

  async updateScenario(id: number, scenario: Partial<Scenario>): Promise<Scenario | null> {
    try {
      const { data: oldData } = await supabase
        .from('scenarios')
        .select('*')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('scenarios')
        .update(scenario)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating scenario:', error);
        return null;
      }

      await this.logAudit('update', 'scenarios', id.toString(), oldData, data);
      return data;
    } catch (error) {
      console.error('Unexpected error updating scenario:', error);
      return null;
    }
  }

  async deleteScenario(id: number): Promise<boolean> {
    try {
      const { data: oldData } = await supabase
        .from('scenarios')
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting scenario:', error);
        return false;
      }

      await this.logAudit('delete', 'scenarios', id.toString(), oldData, null);
      return true;
    } catch (error) {
      console.error('Unexpected error deleting scenario:', error);
      return false;
    }
  }

  // Health check
  async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('executive_metrics')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Database connection error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected connection error:', error);
      return false;
    }
  }
}

export const dataService = new DataService();
export default DataService;
