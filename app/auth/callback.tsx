import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/services/supabase';
import Colors from '@/constants/colors';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('[AuthCallback] Received params:', params);
      
      try {
        const accessToken = params.access_token as string;
        const refreshToken = params.refresh_token as string;
        
        if (accessToken && refreshToken) {
          console.log('[AuthCallback] Setting session with tokens...');
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('[AuthCallback] Error setting session:', error.message);
            router.replace('/login');
            return;
          }

          console.log('[AuthCallback] Session set successfully, redirecting to app...');
          router.replace('/(tabs)/(listen)');
        } else {
          console.error('[AuthCallback] Missing tokens in callback');
          router.replace('/login');
        }
      } catch (err) {
        console.error('[AuthCallback] Error handling callback:', err);
        router.replace('/login');
      }
    };

    handleCallback();
  }, [params, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.dark.primary} />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
});
