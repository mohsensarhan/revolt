import { useState, useEffect, useCallback } from 'react';
import { dataService, User } from '@/lib/data-service';
import { supabase } from '@/lib/supabase';

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  checkConnection: () => Promise<boolean>;
}

/**
 * Hook for authentication state and operations
 * Manages user session and role-based access
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load current user
  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await dataService.getCurrentUser();
      setUser(currentUser);
      setError(null);
    } catch (err) {
      console.error('Error loading user:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in
  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const loggedInUser = await dataService.signIn(email, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        return true;
      }
      setError('Invalid credentials');
      return false;
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await dataService.signOut();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out');
    }
  }, []);

  // Check database connection
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const isConnected = await dataService.checkConnection();
      if (!isConnected) {
        setError('Database connection failed');
      }
      return isConnected;
    } catch (err) {
      console.error('Error checking connection:', err);
      setError('Database connection error');
      return false;
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser();
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUser]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    signIn,
    signOut,
    checkConnection,
  };
}
