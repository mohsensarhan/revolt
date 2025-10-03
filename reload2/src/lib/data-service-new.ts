import { supabase, supabaseAdmin, Database } from './supabase';

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
  scenario_factors?: Record<string, number>;
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
      // Get current metrics for audit log
      const currentMetrics = await this.getExecutiveMetrics();

      const { data, error } = await supabaseAdmin
        .from('executive_metrics')
        .upsert([metrics])
        .select()
        .single();

      if (error) {
        console.error('Error updating executive metrics:', error);
        return null;
      }

      // Log the action
      await this.logAudit('update', 'executive_metrics', data.id?.toString() || '1', currentMetrics, data);

      // Force a real-time update by broadcasting a change
      console.log('📡 Broadcasting real-time update for metrics:', data);
      const broadcastChannel = new BroadcastChannel('executive_metrics_updates');
      broadcastChannel.postMessage({ type: 'metrics_updated', data });
      broadcastChannel.close();

      return data;
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
            callback(payload.new as ExecutiveMetrics);
          }
        }
      )
      .subscribe();

    // Listen for broadcast channel updates as a fallback
    const broadcastChannel = new BroadcastChannel('executive_metrics_updates');
    broadcastChannel.onmessage = (event) => {
      if (event.data.type === 'metrics_updated') {
        console.log('📡 Broadcast channel update received:', event.data.data);
        callback(event.data.data);
      }
    };

    return () => {
      subscription.unsubscribe();
      broadcastChannel.close();
    };
  }

  // User Operations
  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data || [];
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

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        // Fallback: return user data from auth if table query fails (schema cache issue)
        return {
          id: user.id,
          email: user.email || '',
          role: 'admin', // Default to admin for initial setup
          created_at: user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      return data;
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
