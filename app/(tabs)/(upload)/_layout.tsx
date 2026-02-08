import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function UploadLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.dark.background,
        },
        headerTintColor: Colors.dark.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: Colors.dark.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Admin Dashboard',
        }}
      />
      <Stack.Screen
        name="upload"
        options={{
          title: 'Upload Track',
        }}
      />
    </Stack>
  );
}
