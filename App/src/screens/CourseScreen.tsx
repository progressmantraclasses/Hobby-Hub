import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePlanStore } from '../store/planStore';
import { Colors } from '../theme/colors';

export default function CourseScreen() {
  const { hobbies, setActiveHobby } = usePlanStore();
  const nav = useNavigation<NativeStackNavigationProp<any>>();
  const hobbyList = Object.values(hobbies);

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
            const completed = plan.chapters.filter(c => chapterProgress[c.id] === 'completed').length;
            const progress = plan.chapters.length ? Math.round((completed / plan.chapters.length) * 100) : 0;
            return (
              <TouchableOpacity
                key={plan.hobby}
                style={s.card}
                activeOpacity={0.8}
                onPress={() => {
                  setActiveHobby(plan.hobby);
                  nav.navigate('CourseDetail');
                }}
              >
                <View style={s.cardHeader}>
                  <View style={s.cardInfo}>
                    <Text style={s.cardTitle} numberOfLines={1}>{plan.hobby}</Text>
                    <Text style={s.cardLevel}>{plan.currentLevel} → {plan.targetLevel}</Text>
                  </View>
                  <View style={s.progressCircle}>
                    <Text style={s.progressText}>{progress}%</Text>
                  </View>
                </View>
                <Text style={s.cardGoal} numberOfLines={2}>{plan.goal}</Text>
              </TouchableOpacity>
            );
          })
        )}

        <TouchableOpacity style={s.addBtn} onPress={() => nav.navigate('Learn')} activeOpacity={0.85}>
          <Text style={s.addBtnText}>+ Add New Course</Text>
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
  
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: Colors.grayLight, shadowColor: Colors.primary, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardInfo: { flex: 1, paddingRight: 16 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: Colors.dark, marginBottom: 4 },
  cardLevel: { fontSize: 12, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  cardGoal: { fontSize: 14, color: Colors.gray, lineHeight: 20 },
  
  progressCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.primaryLight },
  progressText: { fontSize: 12, fontWeight: '800', color: Colors.primary },

  addBtn: { backgroundColor: Colors.primary, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 12 },
  addBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800' }
});
