import { Tabs } from "expo-router";
import { Disc3, Compass, Heart, User } from "lucide-react-native";
import React from "react";
import { View, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { useAudio } from "@/providers/AudioProvider";
import MiniPlayer from "@/components/MiniPlayer";

export default function TabLayout() {
  const { currentTrack } = useAudio();

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.dark.primary,
          tabBarInactiveTintColor: Colors.dark.textMuted,
          tabBarStyle: {
            backgroundColor: Colors.dark.tabBar,
            borderTopColor: Colors.dark.tabBarBorder,
            borderTopWidth: StyleSheet.hairlineWidth,
            paddingTop: 8,
            height: currentTrack ? 90 : 85,
            paddingBottom: currentTrack ? 10 : 30,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
            letterSpacing: 0.5,
            marginTop: 4,
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="(listen)"
          options={{
            title: "Listen",
            tabBarIcon: ({ color, size }) => <Disc3 color={color} size={size - 2} strokeWidth={1.5} />,
          }}
        />
        <Tabs.Screen
          name="(browse)"
          options={{
            title: "Browse",
            tabBarIcon: ({ color, size }) => <Compass color={color} size={size - 2} strokeWidth={1.5} />,
          }}
        />
        <Tabs.Screen
          name="(saved)"
          options={{
            title: "Saved",
            tabBarIcon: ({ color, size }) => <Heart color={color} size={size - 2} strokeWidth={1.5} />,
          }}
        />
        <Tabs.Screen
          name="(account)"
          options={{
            title: "Account",
            tabBarIcon: ({ color, size }) => <User color={color} size={size - 2} strokeWidth={1.5} />,
          }}
        />
      </Tabs>
      {currentTrack && <MiniPlayer />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
});
