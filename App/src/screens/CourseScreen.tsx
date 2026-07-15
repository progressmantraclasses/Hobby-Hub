import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { usePlanStore } from '../store/planStore';
import { Colors } from '../theme/colors';
import { hobbyCompletion, countCompletedChapters } from '../utils/xp';
import ScreenLoader from '../components/ScreenLoader';
import { hobbyEmoji } from '../constants/hobbies';
import CourseCard from '../components/CourseCard';
import { MainTabScreenNavigationProp } from '../navigation/types';

export default function CourseScreen() {
  const { hobbies, setActiveHobby, activeHobbyId, hasHydrated } = usePlanStore();
  const nav = useNavigation<MainTabScreenNavigationProp<'Course'>>();
  const hobbyList = Object.values(hobbies);

  if (!hasHydrated) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScreenLoader />
      </SafeAreaView>
    );
  }

  const totalChapters = hobbyList.reduce((sum, h) => sum + h.plan.chapters.length, 0);
  const totalDone = hobbyList.reduce((sum, h) => sum + countCompletedChapters(h.chapterProgress, h.plan.chapters), 0);
  const overallPct = totalChapters ? Math.round((totalDone / totalChapters) * 100) : 0;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>Your Courses</Text>
          <Text style={s.sub}>Continue your learning journey</Text>
        </View>

        {hobbyList.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📚</Text>
            <Text style={s.emptyTitle}>No courses yet</Text>
            <Text style={s.emptyText}>Start a hobby to see your learning path here.</Text>
          </View>
        ) : (
          <>
            <View style={s.summaryBar}>
              <View style={s.summaryStat}>
                <Text style={s.summaryValue}>{hobbyList.length}</Text>
                <Text style={s.summaryLabel}>{hobbyList.length === 1 ? 'Course' : 'Courses'}</Text>
              </View>
              <View style={s.summaryDivider} />
              <View style={s.summaryStat}>
                <Text style={s.summaryValue}>{totalDone}/{totalChapters}</Text>
                <Text style={s.summaryLabel}>Chapters Done</Text>
              </View>
              <View style={s.summaryDivider} />
              <View style={s.summaryStat}>
                <Text style={s.summaryValue}>{overallPct}%</Text>
                <Text style={s.summaryLabel}>Overall</Text>
              </View>
            </View>

            {hobbyList.map(({ plan, chapterProgress }) => {
              const pct = hobbyCompletion(chapterProgress, plan.chapters);
              const done = countCompletedChapters(chapterProgress, plan.chapters);
              const isActive = activeHobbyId === plan.hobby;

              return (
                <CourseCard
                  key={plan.hobby}
                  hobbyName={plan.hobby}
                  emoji={hobbyEmoji(plan.hobby)}
                  currentLevel={plan.currentLevel}
                  targetLevel={plan.targetLevel}
                  progressPct={pct}
                  chaptersCompleted={done}
                  totalChapters={plan.chapters.length}
                  isActive={isActive}
                  onPress={() => {
                    setActiveHobby(plan.hobby);
                    nav.navigate('CourseDetail');
                  }}
                />
              );
            })}
          </>
        )}

        <TouchableOpacity style={s.addBtn} onPress={() => nav.navigate('Learn')} activeOpacity={0.85}>
          <Text style={s.addBtnIcon}>+</Text>
          <View>
            <Text style={s.addBtnTitle}>Start New Course</Text>
            <Text style={s.addBtnSub}>Add another hobby to your list</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { padding: 24, paddingBottom: 100 },
  header: { marginBottom: 24 },
  title: { fontSize: 30, fontWeight: '900', color: Colors.dark, marginBottom: 4 },
  sub: { fontSize: 15, color: Colors.gray },
  empty: { paddingVertical: 48, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.dark, marginBottom: 6 },
  emptyText: { fontSize: 14, color: Colors.gray, textAlign: 'center' },



  summaryBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 18, paddingVertical: 16, marginBottom: 20, borderWidth: 1, borderColor: Colors.grayLight },
  summaryStat: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 17, fontWeight: '900', color: Colors.dark, marginBottom: 2 },
  summaryLabel: { fontSize: 11, fontWeight: '700', color: Colors.gray, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryDivider: { width: 1, height: 32, backgroundColor: Colors.grayLight },

  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryBg, padding: 20, borderRadius: 20, marginTop: 8, borderWidth: 1.5, borderColor: Colors.primaryLight, borderStyle: 'dashed' },
  addBtnIcon: { fontSize: 28, fontWeight: '400', color: Colors.primary, marginRight: 16, width: 40, textAlign: 'center' },
  addBtnTitle: { fontSize: 16, fontWeight: '800', color: Colors.primary, marginBottom: 2 },
  addBtnSub: { fontSize: 13, color: Colors.primary, opacity: 0.8 },
});
