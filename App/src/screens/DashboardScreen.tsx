import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlanStore, ChapterStatus } from '../store/planStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { updateAndGetStreak } from '../utils/dateStreak';
import { Colors } from '../theme/colors';
import ScreenLoader from '../components/ScreenLoader';
import { RANK } from '../constants/rank';
import StatsRow from '../components/StatsRow';
import ProgressBar from '../components/ProgressBar';
import ChapterCard from '../components/ChapterCard';

export default function DashboardScreen() {
  const { hobbies, activeHobbyId, hasHydrated } = usePlanStore();
  const nav = useNavigation<NativeStackNavigationProp<any>>();
  const [streak, setStreak] = useState(0);

  useEffect(() => { updateAndGetStreak().then(setStreak).catch(() => {}); }, []);

  if (!hasHydrated) {
    return <SafeAreaView style={s.safe}><ScreenLoader /></SafeAreaView>;
  }

  const active = activeHobbyId ? hobbies[activeHobbyId] : null;
  const plan = active?.plan ?? null;
  const chapterProgress = active?.chapterProgress ?? {};

  if (!plan) return <SafeAreaView style={s.safe}><Text style={s.empty}>No plan found.</Text></SafeAreaView>;

  const chapters = [...plan.chapters].sort((a, b) => a.order - b.order);
  const completed = chapters.filter(c => chapterProgress[c.id] === 'completed').length;
  const xp = completed * 100;
  const progress = chapters.length ? completed / chapters.length : 0;
  const firstActive = chapters.find(c => {
    const st = chapterProgress[c.id] || 'pending';
    return st === 'pending' || st === 'in_progress';
  });

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Hobby Title Row ── */}
        <View style={s.hobbyRow}>
          <View>
            <Text style={s.hobbyLabel}>LEARNING</Text>
            <Text style={s.hobbyName}>{plan.hobby}</Text>
          </View>
          <View style={s.rankBadge}>
            <Text style={s.rankText}>{RANK(xp)}</Text>
          </View>
        </View>

        {/* ── Goal Card ── */}
        <View style={s.goalCard}>
          <Text style={s.sectionLabel}>🎯 YOUR GOAL</Text>
          <Text style={s.goalText}>{plan.goal}</Text>
        </View>

        {/* ── Overview Card ── */}
        <View style={s.overviewCard}>
          <Text style={s.sectionLabel}>📖 OVERVIEW</Text>
          <Text style={s.overviewText}>{plan.overview}</Text>
        </View>

        {/* ── Stats Row ── */}
        <StatsRow
          stats={[
            { icon: '⚡', val: `${xp} XP`,               lbl: 'Earned'   },
            { icon: '📅', val: `${plan.estimatedDurationWeeks}w`, lbl: 'Duration'  },
            { icon: '⏱', val: `${plan.weeklyTimeHours}h`, lbl: 'Per Week' },
            { icon: '🔥', val: `${streak}d`,              lbl: 'Streak'   },
          ]}
        />

        {/* ── XP Progress Bar ── */}
        <View style={s.xpRow}>
          <Text style={s.xpLabel}>Progress — {completed}/{chapters.length} chapters</Text>
          <Text style={s.xpVal}>{Math.round(progress * 100)}%</Text>
        </View>
        <ProgressBar progress={progress} style={{ marginBottom: 20 }} />

        {/* ── Chapter List ── */}
        <Text style={s.chapHeading}>📚 Chapters</Text>
        {chapters.map((ch, idx) => {
          const status: ChapterStatus = chapterProgress[ch.id] || 'pending';
          const locked = idx > 0 && chapterProgress[chapters[idx - 1].id] !== 'completed';

          return (
            <ChapterCard
              key={ch.id}
              id={ch.id}
              order={ch.order}
              title={ch.title}
              summary={ch.summary}
              estimatedMinutes={ch.estimatedMinutes}
              status={status}
              locked={locked}
              isCurrent={false}
              onPress={() => !locked && nav.navigate('ChapterDetail', { chapter: ch, hobbyId: activeHobbyId })}
            />
          );
        })}

        <View style={s.footerSpacer} />
      </ScrollView>

      {firstActive && (
        <View style={s.fab}>
          <TouchableOpacity style={s.fabBtn} onPress={() => nav.navigate('ChapterDetail', { chapter: firstActive, hobbyId: activeHobbyId })} activeOpacity={0.85}>
            <Text style={s.fabSub}>CONTINUE LEARNING</Text>
            <Text style={s.fabTitle} numberOfLines={1}>{firstActive.title}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface }, scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }, empty: { textAlign: 'center', marginTop: 60, fontSize: 16, color: Colors.gray },
  hobbyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }, hobbyLabel: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 2, marginBottom: 3 }, hobbyName: { fontSize: 28, fontWeight: '900', color: Colors.dark }, rankBadge: { backgroundColor: Colors.primaryBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.primaryLight }, rankText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  goalCard: { backgroundColor: Colors.primary, borderRadius: 18, padding: 18, marginBottom: 10, shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 }, sectionLabel: { fontSize: 10, fontWeight: '800', color: Colors.primaryLight, letterSpacing: 1.5, marginBottom: 6 }, goalText: { fontSize: 17, fontWeight: '700', color: Colors.white, lineHeight: 25 },
  overviewCard: { backgroundColor: Colors.white, borderRadius: 18, padding: 18, marginBottom: 10, borderWidth: 1, borderColor: Colors.grayLight }, overviewText: { fontSize: 14, color: Colors.gray, lineHeight: 22 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }, xpLabel: { fontSize: 13, fontWeight: '700', color: Colors.dark }, xpVal: { fontSize: 13, fontWeight: '700', color: Colors.primary }, chapHeading: { fontSize: 15, fontWeight: '800', color: Colors.dark, marginBottom: 10 },
  fab: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 }, fabBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20, shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 }, fabSub: { fontSize: 10, fontWeight: '800', color: Colors.primaryLight, letterSpacing: 1.5, marginBottom: 3 }, fabTitle: { fontSize: 15, fontWeight: '700', color: Colors.white }, footerSpacer: { height: 110 },
});
