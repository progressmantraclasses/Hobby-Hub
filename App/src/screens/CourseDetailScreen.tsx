import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlanStore, ChapterStatus } from '../store/planStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import ScreenLoader from '../components/ScreenLoader';
import { RANK } from '../constants/rank';
import { CHAPTER_STATUS_STYLE } from '../constants/chapterStatus';

export default function CourseDetailScreen() {
  const { hobbies, activeHobbyId, streak, updateStreak, hasHydrated } = usePlanStore();
  const nav = useNavigation<NativeStackNavigationProp<any>>();

  useEffect(() => { updateStreak(); }, [updateStreak]);

  if (!hasHydrated) {
    return (
      <SafeAreaView style={s.safe}>
        <ScreenLoader />
      </SafeAreaView>
    );
  }

  const active = activeHobbyId ? hobbies[activeHobbyId] : null;
  if (!active) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.emptyWrap}>
          <Text style={s.emptyIcon}>📚</Text>
          <Text style={s.emptyTitle}>No Active Course</Text>
          <Text style={s.emptySub}>Go to Learn tab to start a new hobby plan.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { plan, chapterProgress } = active;
  const chapters = [...plan.chapters].sort((a, b) => a.order - b.order);
  const completed = chapters.filter(c => chapterProgress[c.id] === 'completed').length;
  const progress = chapters.length ? completed / chapters.length : 0;
  const firstActive = chapters.find(c => {
    const st = chapterProgress[c.id] || 'pending';
    return st === 'pending' || st === 'in_progress';
  });

  const courseXp = completed * 50;

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <View style={s.hobbyRow}>
          <View>
            <Text style={s.hobbyLabel}>LEARNING</Text>
            <Text style={s.hobbyName}>{plan.hobby}</Text>
          </View>
          <View style={s.rankBadge}>
            <Text style={s.rankText}>{RANK(courseXp)}</Text>
          </View>
        </View>

        <View style={s.goalCard}>
          <Text style={s.sectionLabel}>🎯 YOUR GOAL</Text>
          <Text style={s.goalText}>{plan.goal}</Text>
        </View>



        <View style={s.overviewSection}>
          <Text style={s.sectionLabel}>📖 OVERVIEW</Text>
          <Text style={s.overviewText}>{plan.overview}</Text>
        </View>

        <View style={s.statsContainer}>
          {[
            { icon: '⚡', val: `${courseXp}`, label: 'XP Earned' },
            { icon: '📅', val: `${plan.estimatedDurationWeeks}w`, label: 'Duration' },
            { icon: '⏱', val: `${plan.weeklyTimeHours}h`, label: 'Weekly Target' },
            { icon: '🔥', val: `${streak}d`, label: 'Streak' },
          ].map((st) => (
            <View key={st.label} style={s.statCard}>
              <Text style={s.statEmoji}>{st.icon}</Text>
              <Text style={s.statValue}>{st.val}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.progressCard}>
          <View style={s.xpRow}>
            <Text style={s.progressTitle}>🏆 Campaign Progress</Text>
            <Text style={s.progressPercentage}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={s.bar}>
            <View style={[s.barFill, { width: `${progress * 100}%` as any }]} />
          </View>
          <Text style={s.progressSub}>{completed} of {chapters.length} chapters completed</Text>
        </View>

        <Text style={s.chapHeading}>📚 Learning Path</Text>

        <View style={s.chaptersListContainer}>
          <View style={s.timelineLine} />
          {chapters.map((ch, idx) => {
            const status: ChapterStatus = chapterProgress[ch.id] || 'pending';
            const { label, bg, color } = CHAPTER_STATUS_STYLE[status];
            const done = status === 'completed';
            const locked = idx > 0 && chapterProgress[chapters[idx - 1].id] !== 'completed';
            const isCurrent = firstActive && firstActive.id === ch.id;

            return (
              <TouchableOpacity
                key={ch.id}
                style={[
                  s.card,
                  done && s.cardDone,
                  locked && s.cardLocked,
                  isCurrent && s.cardActive
                ]}
                onPress={() => !locked && nav.navigate('ChapterDetail', { chapter: ch, hobbyId: activeHobbyId })}
                activeOpacity={locked ? 1 : 0.75}
              >
                {isCurrent && <View style={s.activeBadge}><Text style={s.activeBadgeText}>ACTIVE QUEST</Text></View>}

                <View style={[
                  s.num,
                  done && s.numDone,
                  locked && s.numLocked,
                  isCurrent && s.numActive
                ]}>
                  <Text style={[s.numText, (done || locked || isCurrent) && s.numTextAlt]}>
                    {locked ? '🔒' : done ? '✓' : ch.order}
                  </Text>
                </View>

                <View style={s.cardBody}>
                  <Text style={[s.cardTitle, done && s.cardTitleDone]} numberOfLines={1}>{ch.title}</Text>
                  <Text style={s.cardSub} numberOfLines={2}>{ch.summary}</Text>
                  <View style={s.cardMeta}>
                    <Text style={s.metaTime}>⏱ {ch.estimatedMinutes} min</Text>
                    <Text style={s.metaXP}>+50 XP</Text>
                    {label ? <View style={[s.pill, { backgroundColor: bg }]}><Text style={[s.pillText, { color }]}>{label}</Text></View> : null}
                  </View>
                </View>

                {!locked && <Text style={[s.arrow, done && { color: Colors.success }]}>›</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

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

  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: Colors.dark, marginBottom: 8 },
  emptySub: { fontSize: 15, color: Colors.gray, textAlign: 'center', lineHeight: 22 },

  hobbyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  hobbyLabel: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 2, marginBottom: 3 },
  hobbyName: { fontSize: 28, fontWeight: '900', color: Colors.dark },
  rankBadge: { backgroundColor: Colors.primaryBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.primaryLight },
  rankText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  goalCard: { backgroundColor: Colors.primaryBg, borderRadius: 18, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: Colors.primaryCard },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: Colors.primary, letterSpacing: 1.5, marginBottom: 8 },
  goalText: { fontSize: 16, fontWeight: '700', color: Colors.dark, lineHeight: 24 },

  overviewSection: { paddingHorizontal: 4, marginBottom: 20 },
  overviewText: { fontSize: 14, color: Colors.gray, lineHeight: 22 },

  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 8 },
  statCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 16, paddingVertical: 12, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.grayLight, shadowColor: Colors.primary, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1
  },
  statEmoji: { fontSize: 18, marginBottom: 4 },
  statValue: { fontSize: 13, fontWeight: '900', color: Colors.dark },
  statLabel: { fontSize: 8, color: Colors.gray, fontWeight: '700', textTransform: 'uppercase', marginTop: 2, textAlign: 'center' },

  progressCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 18, marginBottom: 24, borderWidth: 1.5, borderColor: Colors.grayLight },
  progressTitle: { fontSize: 14, fontWeight: '800', color: Colors.dark },
  progressPercentage: { fontSize: 15, fontWeight: '900', color: Colors.primary },
  progressSub: { fontSize: 11, color: Colors.gray, fontWeight: '600', marginTop: 6 },

  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  bar: { height: 8, backgroundColor: Colors.grayLight, borderRadius: 6, overflow: 'hidden' },
  barFill: { height: 8, backgroundColor: Colors.primary, borderRadius: 6 },

  chapHeading: { fontSize: 16, fontWeight: '900', color: Colors.dark, marginBottom: 16, letterSpacing: -0.5 },

  chaptersListContainer: { position: 'relative' },
  timelineLine: {
    position: 'absolute', left: 32, top: 20, bottom: 20, width: 3, backgroundColor: Colors.primaryLight, zIndex: 0
  },

  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 18, padding: 16,
    marginBottom: 14, borderWidth: 1.5, borderColor: Colors.grayLight, position: 'relative', zIndex: 1,
    shadowColor: Colors.black, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1
  },
  cardActive: {
    borderColor: Colors.primary, borderWidth: 2, shadowColor: Colors.primary, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3
  },
  cardDone: { opacity: 0.95 },
  cardLocked: { opacity: 0.85 },

  activeBadge: {
    position: 'absolute', top: -10, right: 16, backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, zIndex: 2
  },
  activeBadgeText: { color: Colors.white, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },

  num: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryBg, borderWidth: 1.5,
    borderColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 14, zIndex: 2
  },
  numActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  numDone: { backgroundColor: Colors.success, borderColor: Colors.success },
  numLocked: { backgroundColor: Colors.grayLight, borderColor: Colors.grayLight },
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

  fab: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 },
  fabBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20, shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 },
  fabSub: { fontSize: 10, fontWeight: '800', color: Colors.primaryLight, letterSpacing: 1.5, marginBottom: 3 },
  fabTitle: { fontSize: 15, fontWeight: '700', color: Colors.white },
  footerSpacer: { height: 110 },
});
