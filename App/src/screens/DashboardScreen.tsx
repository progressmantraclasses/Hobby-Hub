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
import { CHAPTER_STATUS_STYLE } from '../constants/chapterStatus';

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
        <View style={s.statsRow}>
          {[
            { icon: '⚡', val: `${xp} XP`,               lbl: 'Earned'   },
            { icon: '📅', val: `${plan.estimatedDurationWeeks}w`, lbl: 'Duration'  },
            { icon: '⏱', val: `${plan.weeklyTimeHours}h`, lbl: 'Per Week' },
            { icon: '🔥', val: `${streak}d`,              lbl: 'Streak'   },
          ].map((st, i, arr) => (
            <React.Fragment key={st.lbl}>
              <View style={s.stat}>
                <Text style={s.statIcon}>{st.icon}</Text>
                <Text style={s.statVal}>{st.val}</Text>
                <Text style={s.statLbl}>{st.lbl}</Text>
              </View>
              {i < arr.length - 1 && <View style={s.statDiv} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── XP Progress Bar ── */}
        <View style={s.xpRow}>
          <Text style={s.xpLabel}>Progress — {completed}/{chapters.length} chapters</Text>
          <Text style={s.xpVal}>{Math.round(progress * 100)}%</Text>
        </View>
        <View style={s.bar}><View style={[s.barFill, { width: `${progress * 100}%` as any }]} /></View>

        {/* ── Chapter List ── */}
        <Text style={s.chapHeading}>📚 Chapters</Text>
        {chapters.map((ch, idx) => {
          const status: ChapterStatus = chapterProgress[ch.id] || 'pending';
          const { label, bg, color } = CHAPTER_STATUS_STYLE[status];
          const done = status === 'completed';
          const locked = idx > 0 && chapterProgress[chapters[idx - 1].id] !== 'completed';

          return (
            <TouchableOpacity
              key={ch.id}
              style={[s.card, done && s.cardDone, locked && s.cardLocked]}
              onPress={() => !locked && nav.navigate('ChapterDetail', { chapter: ch, hobbyId: activeHobbyId })}
              activeOpacity={locked ? 1 : 0.75}
            >
              {/* Left: order number */}
              <View style={[s.num, done && s.numDone, locked && s.numLocked]}>
                <Text style={[s.numText, (done || locked) && s.numTextAlt]}>
                  {locked ? '🔒' : done ? '✓' : ch.order}
                </Text>
              </View>

              {/* Body */}
              <View style={s.cardBody}>
                <Text style={[s.cardTitle, done && s.cardTitleDone]} numberOfLines={1}>{ch.title}</Text>
                <Text style={s.cardSub} numberOfLines={2}>{ch.summary}</Text>
                <View style={s.cardMeta}>
                  <Text style={s.metaTime}>⏱ {ch.estimatedMinutes} min</Text>
                  <Text style={s.metaXP}>+100 XP</Text>
                  {label ? <View style={[s.pill, { backgroundColor: bg }]}><Text style={[s.pillText, { color }]}>{label}</Text></View> : null}
                </View>
              </View>

              {!locked && <Text style={[s.arrow, done && { color: Colors.success }]}>›</Text>}
            </TouchableOpacity>
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
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 16, color: Colors.gray },

  hobbyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  hobbyLabel: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 2, marginBottom: 3 },
  hobbyName: { fontSize: 28, fontWeight: '900', color: Colors.dark },
  rankBadge: { backgroundColor: Colors.primaryBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.primaryLight },
  rankText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  goalCard: { backgroundColor: Colors.primary, borderRadius: 18, padding: 18, marginBottom: 10, shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: Colors.primaryLight, letterSpacing: 1.5, marginBottom: 6 },
  goalText: { fontSize: 17, fontWeight: '700', color: Colors.white, lineHeight: 25 },

  overviewCard: { backgroundColor: Colors.white, borderRadius: 18, padding: 18, marginBottom: 10, borderWidth: 1, borderColor: Colors.grayLight },
  overviewText: { fontSize: 14, color: Colors.gray, lineHeight: 22 },

  statsRow: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 18, paddingVertical: 16, marginBottom: 14, borderWidth: 1, borderColor: Colors.grayLight },
  stat: { flex: 1, alignItems: 'center' },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statVal: { fontSize: 14, fontWeight: '800', color: Colors.dark },
  statLbl: { fontSize: 10, color: Colors.gray, fontWeight: '600', marginTop: 2 },
  statDiv: { width: 1, backgroundColor: Colors.grayLight },

  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLabel: { fontSize: 13, fontWeight: '700', color: Colors.dark },
  xpVal: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  bar: { height: 8, backgroundColor: Colors.grayLight, borderRadius: 6, overflow: 'hidden', marginBottom: 20 },
  barFill: { height: 8, backgroundColor: Colors.primary, borderRadius: 6 },

  chapHeading: { fontSize: 15, fontWeight: '800', color: Colors.dark, marginBottom: 10 },

  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.grayLight },
  cardDone: { opacity: 0.7 },
  cardLocked: { opacity: 0.45 },

  num: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primaryBg, borderWidth: 1.5, borderColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  numDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  numLocked: { backgroundColor: Colors.grayLight, borderColor: Colors.grayLight },
  numText: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  numTextAlt: { fontSize: 16, color: Colors.white },

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

  fab: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 },
  fabBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20, shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 },
  fabSub: { fontSize: 10, fontWeight: '800', color: Colors.primaryLight, letterSpacing: 1.5, marginBottom: 3 },
  fabTitle: { fontSize: 15, fontWeight: '700', color: Colors.white },
  footerSpacer: { height: 110 },
});
