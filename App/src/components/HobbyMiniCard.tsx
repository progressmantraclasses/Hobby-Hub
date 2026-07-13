import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';

interface HobbyMiniCardProps { hobbyName: string; emoji: string; percentage: number; isActive: boolean; onPress: () => void; }

export default function HobbyMiniCard({ hobbyName, emoji, percentage, isActive, onPress }: HobbyMiniCardProps) {
  return (
    <TouchableOpacity style={[s.hobbyMini, isActive && s.hobbyMiniActive]} onPress={onPress} activeOpacity={0.8}>
      <Text style={s.hobbyMiniEmoji}>{emoji}</Text>
      <Text style={s.hobbyMiniName} numberOfLines={1}>{hobbyName}</Text>
      <Text style={s.hobbyMiniPct}>{Math.round(percentage)}%</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  hobbyMini: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, alignItems: 'center', minWidth: 90, borderWidth: 1.5, borderColor: Colors.grayLight },
  hobbyMiniActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  hobbyMiniEmoji: { fontSize: 24, marginBottom: 6 },
  hobbyMiniName: { fontSize: 11, fontWeight: '700', color: Colors.dark, marginBottom: 4, textAlign: 'center' },
  hobbyMiniPct: { fontSize: 12, fontWeight: '800', color: Colors.primary },
});
