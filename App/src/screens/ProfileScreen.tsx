import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlanStore } from '../store/planStore';
import { Colors } from '../theme/colors';
import { getLevel, getXpProgress, hobbyCompletion, XP_PER_LEVEL } from '../utils/xp';

export default function ProfileScreen() {
  const { xpTotal, streak, longestStreak, hobbies } = usePlanStore();
  const level = getLevel(xpTotal);
  const xpProgress = getXpProgress(xpTotal);
  const hobbyList = Object.values(hobbies);

  const totalChaptersDone = hobbyList.reduce((acc, { plan, chapterProgress }) =>
    acc + plan.chapters.filter(c => chapterProgress[c.id] === 'completed').length, 0);
  const hasFullyMastered = hobbyList.some(({ plan, chapterProgress }) =>
    plan.chapters.every(c => chapterProgress[c.id] === 'completed'));

  const BADGES = [
    { id: 'first_chapter', icon: '📖', title: 'First Step',        desc: 'Complete your first chapter', earned: totalChaptersDone >= 1 },
    { id: 'streak_3',      icon: '🔥', title: '3-Day Streak',      desc: 'Stay consistent for 3 days',  earned: streak >= 3 },
    { id: 'xp_100',        icon: '⚡', title: 'XP Hunter',         desc: 'Earn 100 XP total',           earned: xpTotal >= 100 },
    { id: 'xp_500',        icon: '💎', title: 'Dedicated Learner', desc: 'Earn 500 XP total',           earned: xpTotal >= 500 },
    { id: 'mastered',      icon: '🏆', title: 'Hobby Master',      desc: 'Complete 100% of any hobby',  earned: hasFullyMastered },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Profile</Text>

        <View style={s.xpCard}>
          <Text style={s.levelText}>Level {level}</Text>
          <Text style={s.xpTotal}>{xpTotal} XP</Text>
          <View style={s.bar}>
            <View style={[s.barFill, { width: `${xpProgress * 100}%` as any }]} />
          </View>
          <Text style={s.xpNext}>{XP_PER_LEVEL - (xpTotal % XP_PER_LEVEL)} XP to Level {level + 1}</Text>
        </View>

        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statEmoji}>🔥</Text>
            <Text style={s.statVal}>{streak}</Text>
            <Text style={s.statLbl}>Current Streak</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statBox}>
            <Text style={s.statEmoji}>🏅</Text>
            <Text style={s.statVal}>{longestStreak ?? streak}</Text>
            <Text style={s.statLbl}>Longest Streak</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statBox}>
            <Text style={s.statEmoji}>✅</Text>
            <Text style={s.statVal}>{totalChaptersDone}</Text>
            <Text style={s.statLbl}>Chapters Done</Text>
          </View>
        </View>

        <Text style={s.section}>Badges</Text>
        <View style={s.badgeGrid}>
          {BADGES.map(b => (
            <View key={b.id} style={[s.badge, !b.earned && s.badgeLocked]}>
              <Text style={s.badgeIcon}>{b.icon}</Text>
              <Text style={[s.badgeTitle, !b.earned && s.badgeTextLocked]}>{b.title}</Text>
              <Text style={[s.badgeDesc, !b.earned && s.badgeTextLocked]}>{b.desc}</Text>
            </View>
          ))}
        </View>

        {hobbyList.length > 0 && (
          <>
            <Text style={s.section}>My Hobbies</Text>
            {hobbyList.map(({ plan, chapterProgress }) => {
              const pct = hobbyCompletion(chapterProgress, plan.chapters);
              const done = plan.chapters.filter(c => chapterProgress[c.id] === 'completed').length;
              return (
                <View key={plan.hobby} style={s.hobbyRow}>
                  <View style={s.hobbyInfo}>
                    <Text style={s.hobbyName}>{plan.hobby}</Text>
                    <Text style={s.hobbyMeta}>{done}/{plan.chapters.length} · {Math.round(pct * 100)}%</Text>
                  </View>
                  <View style={s.hobbyBarWrap}>
                    <View style={[s.hobbyBarFill, { width: `${pct * 100}%` as any }]} />
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.dark, marginBottom: 20 },

  xpCard: { backgroundColor: Colors.primary, borderRadius: 20, padding: 24, marginBottom: 16, alignItems: 'center' },
  levelText: { fontSize: 14, fontWeight: '700', color: Colors.primaryLight, marginBottom: 4 },
  xpTotal: { fontSize: 44, fontWeight: '900', color: Colors.white, marginBottom: 16 },
  bar: { width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  barFill: { height: 8, backgroundColor: Colors.white, borderRadius: 6 },
  xpNext: { fontSize: 12, color: Colors.primaryLight },

  statsRow: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 18, paddingVertical: 18, marginBottom: 24, borderWidth: 1, borderColor: Colors.grayLight },
  statBox: { flex: 1, alignItems: 'center' },
  statEmoji: { fontSize: 20, marginBottom: 6 },
  statVal: { fontSize: 18, fontWeight: '900', color: Colors.dark, marginBottom: 2 },
  statLbl: { fontSize: 11, color: Colors.gray, fontWeight: '600' },
  statDiv: { width: 1, backgroundColor: Colors.grayLight },

  section: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 12 },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  badge: { width: '47%', backgroundColor: Colors.white, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.grayLight },
  badgeLocked: { opacity: 0.4 },
  badgeIcon: { fontSize: 26, marginBottom: 8 },
  badgeTitle: { fontSize: 14, fontWeight: '800', color: Colors.dark, marginBottom: 3 },
  badgeDesc: { fontSize: 11, color: Colors.gray, lineHeight: 16 },
  badgeTextLocked: { color: Colors.gray },

  hobbyRow: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.grayLight },
  hobbyInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  hobbyName: { fontSize: 15, fontWeight: '800', color: Colors.dark },
  hobbyMeta: { fontSize: 12, color: Colors.gray },
  hobbyBarWrap: { height: 6, backgroundColor: Colors.grayLight, borderRadius: 4, overflow: 'hidden' },
  hobbyBarFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 4 },
});
