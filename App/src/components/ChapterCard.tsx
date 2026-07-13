import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { ChapterStatus } from '../store/planStore';
import { CHAPTER_STATUS_STYLE } from '../constants/chapterStatus';

interface ChapterCardProps { id: string; order: number; title: string; summary: string; estimatedMinutes: number; status: ChapterStatus; locked: boolean; isCurrent: boolean; onPress: () => void; }

export default function ChapterCard({ order, title, summary, estimatedMinutes, status, locked, isCurrent, onPress }: ChapterCardProps) {
  const { label, bg, color } = CHAPTER_STATUS_STYLE[status];
  const done = status === 'completed';

  return (
    <TouchableOpacity style={[s.card, done && s.cardDone, locked && s.cardLocked, isCurrent && s.cardActive]} onPress={onPress} activeOpacity={locked ? 1 : 0.75}>
      {isCurrent && <View style={s.activeBadge}><Text style={s.activeBadgeText}>ACTIVE QUEST</Text></View>}
      <View style={[s.num, done && s.numDone, locked && s.numLocked, isCurrent && s.numActive]}>
        <Text style={[s.numText, (done || locked || isCurrent) && s.numTextAlt]}>{locked ? '🔒' : done ? '✓' : order}</Text>
      </View>
      <View style={s.cardBody}>
        <Text style={[s.cardTitle, done && s.cardTitleDone]} numberOfLines={1}>{title}</Text>
        <Text style={s.cardSub} numberOfLines={2}>{summary}</Text>
        <View style={s.cardMeta}>
          <Text style={s.metaTime}>⏱ {estimatedMinutes} min</Text>
          <Text style={s.metaXP}>+50 XP</Text>
          {label ? <View style={[s.pill, { backgroundColor: bg }]}><Text style={[s.pillText, { color }]}>{label}</Text></View> : null}
        </View>
      </View>
      {!locked && <Text style={[s.arrow, done && { color: Colors.success }]}>›</Text>}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1.5, borderColor: Colors.grayLight, position: 'relative', zIndex: 1, shadowColor: Colors.black, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  cardActive: { borderColor: Colors.primary, borderWidth: 2, shadowColor: Colors.primary, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 },
  cardDone: { opacity: 0.95 },
  cardLocked: { opacity: 0.85 },
  activeBadge: { position: 'absolute', top: -10, right: 16, backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, zIndex: 2 },
  activeBadgeText: { color: Colors.white, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  num: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryBg, borderWidth: 1.5, borderColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 14, zIndex: 2 },
  numDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  numLocked: { backgroundColor: Colors.grayLight, borderColor: Colors.grayLight },
  numActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  numText: { fontSize: 13, fontWeight: '800', color: Colors.primary },
  numTextAlt: { fontSize: 15, color: Colors.white },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark, marginBottom: 3 },
  cardTitleDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  cardSub: { fontSize: 12, color: Colors.gray, lineHeight: 17, marginBottom: 8 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  metaTime: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  metaXP: { fontSize: 11, color: Colors.primary, fontWeight: '700', backgroundColor: Colors.primaryBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  pill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  pillText: { fontSize: 11, fontWeight: '700' },
  arrow: { fontSize: 24, color: Colors.grayLight, marginLeft: 4 },
});
