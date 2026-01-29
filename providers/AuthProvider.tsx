import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isAdmin: false,
    isLoading: true,
    isInitialized: false,
  });

  const checkAdminStatus = useCallback(async (email: string | undefined): Promise<boolean> => {
    if (!email) return false;
    
    console.log('[Auth] Checking admin status for:', email);
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', email)
        .single();

      if (error) {
        console.log('[Auth] Admin check error (user may not be admin):', error.message);
        return false;
      }

      const isAdmin = !!data;
      console.log('[Auth] Is admin:', isAdmin);
      return isAdmin;
    } catch (err) {
      console.error('[Auth] Exception checking admin status:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    console.log('[Auth] Initializing auth listener...');
    
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('[Auth] Initial session:', session?.user?.email || 'none');
      
      let isAdmin = false;
      if (session?.user?.email) {
        isAdmin = await checkAdminStatus(session.user.email);
      }
      
      setAuthState({
        user: session?.user ?? null,
        session: session,
        isAdmin,
        isLoading: false,
        isInitialized: true,
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Auth state changed:', event, session?.user?.email);
      
      let isAdmin = false;
      if (session?.user?.email) {
        isAdmin = await checkAdminStatus(session.user.email);
      }
      
      setAuthState({
        user: session?.user ?? null,
        session: session,
        isAdmin,
        isLoading: false,
        isInitialized: true,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  const signUpMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      console.log('[Auth] Signing up user:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('[Auth] Sign up error:', error.message);
        throw error;
      }

      console.log('[Auth] Sign up successful');
      return data;
    },
  });

  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      console.log('[Auth] Signing in user:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[Auth] Sign in error:', error.message);
        throw error;
      }

      console.log('[Auth] Sign in successful');
      return data;
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      console.log('[Auth] Signing out...');
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('[Auth] Sign out error:', error.message);
        throw error;
      }

      console.log('[Auth] Sign out successful');
      queryClient.clear();
    },
  });

  const signUp = useCallback(async (email: string, password: string) => {
    return signUpMutation.mutateAsync({ email, password });
  }, [signUpMutation]);

  const signIn = useCallback(async (email: string, password: string) => {
    return signInMutation.mutateAsync({ email, password });
  }, [signInMutation]);

  const signOut = useCallback(async () => {
    return signOutMutation.mutateAsync();
  }, [signOutMutation]);

  return {
    user: authState.user,
    session: authState.session,
    isAdmin: authState.isAdmin,
    isLoading: authState.isLoading || signInMutation.isPending || signUpMutation.isPending,
    isInitialized: authState.isInitialized,
    isAuthenticated: !!authState.session,
    signUp,
    signIn,
    signOut,
    signUpError: signUpMutation.error,
    signInError: signInMutation.error,
  };
});
