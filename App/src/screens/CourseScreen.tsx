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
            <Text style={s.emptyText}>No hobbies yet. Start one!</Text>
          </View>
        ) : (
          hobbyList.map(({ plan, chapterProgress }) => {
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
          })
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
  title: { fontSize: 32, fontWeight: '900', color: Colors.dark, marginBottom: 4 },
  sub: { fontSize: 15, color: Colors.gray },
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: Colors.gray, marginBottom: 16 },

  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryBg, padding: 20, borderRadius: 20, marginTop: 8, borderWidth: 1.5, borderColor: Colors.primaryLight, borderStyle: 'dashed' },
  addBtnIcon: { fontSize: 28, fontWeight: '400', color: Colors.primary, marginRight: 16, width: 40, textAlign: 'center' },
  addBtnTitle: { fontSize: 16, fontWeight: '800', color: Colors.primary, marginBottom: 2 },
  addBtnSub: { fontSize: 13, color: Colors.primary, opacity: 0.8 },
});
