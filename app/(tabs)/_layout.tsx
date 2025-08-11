import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { LegacyColors } from '@/constants/Colors';

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: LegacyColors.black,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          // Common styles for both platforms
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Daily Question',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="questionmark.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="info.circle.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}