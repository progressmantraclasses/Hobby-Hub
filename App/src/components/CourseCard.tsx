import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { ProgressRing } from './ProgressRing';

interface CourseCardProps { hobbyName: string; emoji: string; currentLevel: string; targetLevel: string; progressPct: number; chaptersCompleted: number; totalChapters: number; isActive: boolean; onPress: () => void; }

export default function CourseCard({ hobbyName, emoji, currentLevel, targetLevel, progressPct, chaptersCompleted, totalChapters, isActive, onPress }: CourseCardProps) {
  const isComplete = progressPct >= 1;

  return (
    <TouchableOpacity style={[s.card, isActive && s.cardActive]} activeOpacity={0.85} onPress={onPress}>
      {isActive && <View style={s.activeIndicator} />}

      {isActive && (
        <View style={s.activeBadge}>
          <Text style={s.activeBadgeText}>CONTINUE LEARNING</Text>
        </View>
      )}

      <View style={s.cardHeader}>
        <View style={[s.emojiBadge, isActive && s.emojiBadgeActive]}>
          <Text style={s.emoji}>{emoji}</Text>
        </View>
        <View style={s.cardInfo}>
          <Text style={s.cardTitle} numberOfLines={1}>{hobbyName}</Text>
          <View style={s.levelChip}>
            <Text style={s.cardLevel}>{currentLevel} → {targetLevel}</Text>
          </View>
        </View>
        <ProgressRing
          progress={progressPct}
          trackColor={Colors.grayLight}
          progressColor={isComplete ? Colors.success : Colors.primary}
          textColor={Colors.dark}
        />
      </View>

      <View style={s.divider} />

      <View style={s.cardFooter}>
        <Text style={s.cardProgress}>
          <Text style={s.cardProgressBold}>{chaptersCompleted}</Text> / {totalChapters} chapters completed
        </Text>
        <View style={s.cardArrowBtn}>
          <Text style={s.cardArrow}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1.5, borderColor: Colors.grayLight, shadowColor: Colors.primary, shadowOpacity: 0.08, shadowRadius: 15, elevation: 4, overflow: 'hidden' },
  cardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryTint },
  activeIndicator: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 5, backgroundColor: Colors.primary },
  activeBadge: { alignSelf: 'flex-start', backgroundColor: Colors.primaryBg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12 },
  activeBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  emojiBadge: { width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: Colors.grayLight },
  emojiBadgeActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primaryLight },
  emoji: { fontSize: 28 },
  cardInfo: { flex: 1, paddingRight: 12 },
  cardTitle: { fontSize: 20, fontWeight: '900', color: Colors.dark, marginBottom: 6, letterSpacing: -0.5 },
  levelChip: { alignSelf: 'flex-start' },
  cardLevel: { fontSize: 11, fontWeight: '800', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.8 },
  divider: { height: 1, backgroundColor: Colors.grayLight, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardProgress: { fontSize: 13, fontWeight: '600', color: Colors.gray },
  cardProgressBold: { fontWeight: '800', color: Colors.dark },
  cardArrowBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center' },
  cardArrow: { fontSize: 16, color: Colors.primary, fontWeight: '700' },
});
