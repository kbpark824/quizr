import { View, StyleSheet } from 'react-native';
import { LegacyColors } from '@/constants/Colors';

export default function TabBarBackground() {
  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: LegacyColors.white }]} // Set background to white
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
