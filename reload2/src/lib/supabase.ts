import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Create admin client with service role key for privileged operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false, // Admin client doesn't need sessions
    autoRefreshToken: false,
  },
});

// Database types (will be expanded as we create tables)
export interface Database {
  public: {
    Tables: {
      executive_metrics: {
        Row: {
          id: number;
          created_at: string;
          updated_at: string;
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
        };
        Insert: {
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
        };
        Update: {
          id?: number;
          created_at?: string;
          updated_at?: string;
          meals_delivered?: number;
          people_served?: number;
          cost_per_meal?: number;
          program_efficiency?: number;
          revenue?: number;
          expenses?: number;
          reserves?: number;
          cash_position?: number;
          coverage_governorates?: number;
          scenario_factors?: Record<string, number>;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          role: 'admin' | 'viewer' | 'editor';
          created_at: string;
          updated_at: string;
          last_login?: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: 'admin' | 'viewer' | 'editor';
          created_at?: string;
          updated_at?: string;
          last_login?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'admin' | 'viewer' | 'editor';
          created_at?: string;
          updated_at?: string;
          last_login?: string;
        };
      };
      audit_logs: {
        Row: {
          id: number;
          user_id: string;
          action: string;
          table_name: string;
          record_id: string;
          old_data?: any;
          new_data?: any;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          action: string;
          table_name: string;
          record_id: string;
          old_data?: any;
          new_data?: any;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          action?: string;
          table_name?: string;
          record_id?: string;
          old_data?: any;
          new_data?: any;
          created_at?: string;
        };
      };
    };
  };
}

export default supabase;
