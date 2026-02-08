import createContextHook from '@nkzw/create-context-hook';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-linking';
import { supabase } from '@/services/supabase';
import type { User, Session } from '@supabase/supabase-js';

WebBrowser.maybeCompleteAuthSession();

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
    
    const initAuth = async () => {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Session check timeout')), 10000);
        });
        
        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as Awaited<typeof sessionPromise>;
        
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
      } catch (err: any) {
        console.error('[Auth] Failed to initialize session:', err?.message || err);
        setAuthState({
          user: null,
          session: null,
          isAdmin: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    };
    
    initAuth();

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

  const signInWithGoogleMutation = useMutation({
    mutationFn: async () => {
      console.log('[Auth] Starting Google sign in...');
      
      const redirectUrl = makeRedirectUri({
        scheme: 'com.anonymous.expo-app',
        path: 'auth/callback',
      });
      
      console.log('[Auth] OAuth redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: Platform.OS !== 'web',
        },
      });

      if (error) {
        console.error('[Auth] Google sign in error:', error.message);
        throw error;
      }

      if (Platform.OS !== 'web' && data?.url) {
        console.log('[Auth] Opening OAuth URL...');
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        if (result.type === 'success' && result.url) {
          console.log('[Auth] OAuth callback received');
          const url = new URL(result.url);
          const access_token = url.searchParams.get('access_token');
          const refresh_token = url.searchParams.get('refresh_token');

          if (access_token && refresh_token) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (sessionError) {
              console.error('[Auth] Error setting session:', sessionError.message);
              throw sessionError;
            }

            console.log('[Auth] Google sign in successful');
          } else {
            throw new Error('No access token received from OAuth');
          }
        } else if (result.type === 'cancel') {
          throw new Error('Google sign in cancelled');
        } else {
          throw new Error('Google sign in failed');
        }
      }

      console.log('[Auth] Google sign in successful (web)');
      return data;
    },
  });

  const signUp = useCallback(async (email: string, password: string) => {
    return signUpMutation.mutateAsync({ email, password });
  }, [signUpMutation.mutateAsync]);

  const signIn = useCallback(async (email: string, password: string) => {
    return signInMutation.mutateAsync({ email, password });
  }, [signInMutation.mutateAsync]);

  const signInWithGoogle = useCallback(async () => {
    return signInWithGoogleMutation.mutateAsync();
  }, [signInWithGoogleMutation.mutateAsync]);

  const signOut = useCallback(async () => {
    return signOutMutation.mutateAsync();
  }, [signOutMutation.mutateAsync]);

  return {
    user: authState.user,
    session: authState.session,
    isAdmin: authState.isAdmin,
    isLoading: authState.isLoading || signInMutation.isPending || signUpMutation.isPending || signInWithGoogleMutation.isPending,
    isInitialized: authState.isInitialized,
    isAuthenticated: !!authState.session,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    signUpError: signUpMutation.error,
    signInError: signInMutation.error,
    googleSignInError: signInWithGoogleMutation.error,
  };
});
