import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import ProgressBar from './ProgressBar';

interface HobbyRowProps { hobbyName: string; emoji: string; completedChapters: number; totalChapters: number; progressPct: number; }

export default function HobbyRow({ hobbyName, emoji, completedChapters, totalChapters, progressPct }: HobbyRowProps) {
  return (
    <View style={s.hobbyRow}>
      <Text style={s.hobbyEmoji}>{emoji}</Text>
      <View style={s.hobbyContent}>
        <View style={s.hobbyInfo}>
          <Text style={s.hobbyName}>{hobbyName}</Text>
          <Text style={s.hobbyMeta}>{completedChapters}/{totalChapters}</Text>
        </View>
        <ProgressBar progress={progressPct} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  hobbyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.grayLight, shadowColor: Colors.black, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  hobbyEmoji: { fontSize: 32, marginRight: 16 },
  hobbyContent: { flex: 1 },
  hobbyInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  hobbyName: { fontSize: 16, fontWeight: '800', color: Colors.dark },
  hobbyMeta: { fontSize: 13, fontWeight: '700', color: Colors.gray },
});
