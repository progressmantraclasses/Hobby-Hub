import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { ProgressRing } from './ProgressRing';

interface CourseCardProps { hobbyName: string; emoji: string; currentLevel: string; targetLevel: string; progressPct: number; chaptersCompleted: number; totalChapters: number; isActive: boolean; onPress: () => void; }

export default function CourseCard({ hobbyName, emoji, currentLevel, targetLevel, progressPct, chaptersCompleted, totalChapters, isActive, onPress }: CourseCardProps) {
  return (
    <TouchableOpacity style={[s.card, isActive && s.cardActive]} activeOpacity={0.8} onPress={onPress}>
      {isActive && <View style={s.activeIndicator} />}
      <View style={s.cardHeader}>
        <Text style={s.emoji}>{emoji}</Text>
        <View style={s.cardInfo}>
          <Text style={s.cardTitle} numberOfLines={1}>{hobbyName}</Text>
          <Text style={s.cardLevel}>{currentLevel} → {targetLevel}</Text>
        </View>
        <ProgressRing progress={progressPct} />
      </View>
      <View style={s.divider} />
      <View style={s.cardFooter}>
        <Text style={s.cardProgress}>{chaptersCompleted} / {totalChapters} chapters completed</Text>
        <Text style={s.cardArrow}>→</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1.5, borderColor: Colors.grayLight, shadowColor: Colors.primary, shadowOpacity: 0.08, shadowRadius: 15, elevation: 4, overflow: 'hidden' },
  cardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryTint },
  activeIndicator: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 5, backgroundColor: Colors.primary },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  emoji: { fontSize: 40, marginRight: 16 },
  cardInfo: { flex: 1, paddingRight: 12 },
  cardTitle: { fontSize: 22, fontWeight: '900', color: Colors.dark, marginBottom: 4, letterSpacing: -0.5 },
  cardLevel: { fontSize: 12, fontWeight: '800', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  divider: { height: 1, backgroundColor: Colors.grayLight, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardProgress: { fontSize: 13, fontWeight: '600', color: Colors.gray },
  cardArrow: { fontSize: 20, color: Colors.primary, fontWeight: '700' },
});
