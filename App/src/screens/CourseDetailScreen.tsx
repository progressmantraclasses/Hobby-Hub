import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlanStore, ChapterStatus } from '../store/planStore';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import ScreenLoader from '../components/ScreenLoader';
import { RANK } from '../constants/rank';
import ProgressBar from '../components/ProgressBar';
import ChapterCard from '../components/ChapterCard';
import { XP_PER_CHAPTER } from '../utils/xp';

export default function CourseDetailScreen() {
  const { hobbies, activeHobbyId, streak, updateStreak, hasHydrated } = usePlanStore();
  const nav = useNavigation();

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

  const courseXp = completed * XP_PER_CHAPTER;

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
          <ProgressBar progress={progress} style={{ marginBottom: 6 }} />
          <Text style={s.progressSub}>{completed} of {chapters.length} chapters completed</Text>
        </View>

        <Text style={s.chapHeading}>📚 Learning Path</Text>

        <View style={s.chaptersListContainer}>
          <View style={s.timelineLine} />
          {chapters.map((ch, idx) => {
            const status: ChapterStatus = chapterProgress[ch.id] || 'pending';
            const locked = idx > 0 && chapterProgress[chapters[idx - 1].id] !== 'completed';
            const isCurrent = firstActive && firstActive.id === ch.id;

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
                isCurrent={!!isCurrent}
                onPress={() => !locked && nav.navigate('ChapterDetail', { chapter: ch, hobbyId: activeHobbyId })}
              />
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
  safe: { flex: 1, backgroundColor: Colors.surface }, scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }, emptyIcon: { fontSize: 56, marginBottom: 16 }, emptyTitle: { fontSize: 22, fontWeight: '800', color: Colors.dark, marginBottom: 8 }, emptySub: { fontSize: 15, color: Colors.gray, textAlign: 'center', lineHeight: 22 },
  hobbyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }, hobbyLabel: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 2, marginBottom: 3 }, hobbyName: { fontSize: 28, fontWeight: '900', color: Colors.dark }, rankBadge: { backgroundColor: Colors.primaryBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.primaryLight }, rankText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  goalCard: { backgroundColor: Colors.primaryBg, borderRadius: 18, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: Colors.primaryCard }, sectionLabel: { fontSize: 11, fontWeight: '800', color: Colors.primary, letterSpacing: 1.5, marginBottom: 8 }, goalText: { fontSize: 16, fontWeight: '700', color: Colors.dark, lineHeight: 24 },
  overviewSection: { paddingHorizontal: 4, marginBottom: 20 }, overviewText: { fontSize: 14, color: Colors.gray, lineHeight: 22 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 8 }, statCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 16, paddingVertical: 12, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.grayLight, shadowColor: Colors.primary, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 }, statEmoji: { fontSize: 18, marginBottom: 4 }, statValue: { fontSize: 13, fontWeight: '900', color: Colors.dark }, statLabel: { fontSize: 8, color: Colors.gray, fontWeight: '700', textTransform: 'uppercase', marginTop: 2, textAlign: 'center' },
  progressCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 18, marginBottom: 24, borderWidth: 1.5, borderColor: Colors.grayLight }, progressTitle: { fontSize: 14, fontWeight: '800', color: Colors.dark }, progressPercentage: { fontSize: 15, fontWeight: '900', color: Colors.primary }, progressSub: { fontSize: 11, color: Colors.gray, fontWeight: '600', marginTop: 6 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }, chapHeading: { fontSize: 16, fontWeight: '900', color: Colors.dark, marginBottom: 16, letterSpacing: -0.5 },
  chaptersListContainer: { position: 'relative' }, timelineLine: { position: 'absolute', left: 32, top: 20, bottom: 20, width: 3, backgroundColor: Colors.primaryLight, zIndex: 0 },
  fab: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 }, fabBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 20, shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8 }, fabSub: { fontSize: 10, fontWeight: '800', color: Colors.primaryLight, letterSpacing: 1.5, marginBottom: 3 }, fabTitle: { fontSize: 15, fontWeight: '700', color: Colors.white }, footerSpacer: { height: 110 },
});
