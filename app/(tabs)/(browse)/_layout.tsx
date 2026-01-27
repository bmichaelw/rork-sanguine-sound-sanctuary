import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function BrowseLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.dark.background,
        },
        headerTintColor: Colors.dark.text,
        headerTitleStyle: {
          fontWeight: '300',
          letterSpacing: 1,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: Colors.dark.background,
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Browse',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="theme/[id]" 
        options={{ 
          title: '',
        }} 
      />
    </Stack>
  );
}
