import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';

interface ProgressBarProps { progress: number; color?: string; height?: number; style?: StyleProp<ViewStyle>; }

export default function ProgressBar({ progress, color = Colors.primary, height = 8, style }: ProgressBarProps) {
  const safeProgress = Math.min(Math.max(progress, 0), 1);
  return (
    <View style={[s.bar, { height }, style]}>
      <View style={[s.barFill, { width: `${safeProgress * 100}%` as any, backgroundColor: color, height }]} />
    </View>
  );
}

const s = StyleSheet.create({
  bar: { backgroundColor: Colors.grayLight, borderRadius: 6, overflow: 'hidden', width: '100%' },
  barFill: { borderRadius: 6 },
});
