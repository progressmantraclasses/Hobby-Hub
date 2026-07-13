import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePlanStore } from '../store/planStore';
import { Colors } from '../theme/colors';
import { hobbyCompletion } from '../utils/xp';
import Svg, { Circle } from 'react-native-svg';
import ScreenLoader from '../components/ScreenLoader';
import { hobbyEmoji } from '../constants/hobbies';

const ProgressRing = ({ pct }: { pct: number }) => {
  const size = 64, sw = 6, r = (size - sw) / 2, circ = r * 2 * Math.PI;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle stroke={Colors.primaryBg} fill="none" cx={size / 2} cy={size / 2} r={r} strokeWidth={sw} />
        <Circle stroke={Colors.primary} fill="none" cx={size / 2} cy={size / 2} r={r} strokeWidth={sw}
          strokeDasharray={`${circ} ${circ}`} strokeDashoffset={circ - pct * circ}
          strokeLinecap="round" originX={size / 2} originY={size / 2} rotation="-90" />
      </Svg>
      <Text style={{ fontSize: 13, fontWeight: '900', color: Colors.primary }}>{Math.round(pct * 100)}%</Text>
    </View>
  );
};

export default function CourseScreen() {
  const { hobbies, setActiveHobby, activeHobbyId, hasHydrated } = usePlanStore();
  const nav = useNavigation<NativeStackNavigationProp<any>>();
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
            const done = plan.chapters.filter(c => chapterProgress[c.id] === 'completed').length;
            const isActive = activeHobbyId === plan.hobby;
            
            return (
              <TouchableOpacity
                key={plan.hobby}
                style={[s.card, isActive && s.cardActive]}
                activeOpacity={0.8}
                onPress={() => {
                  setActiveHobby(plan.hobby);
                  nav.navigate('CourseDetail');
                }}
              >
                {isActive && <View style={s.activeIndicator} />}
                <View style={s.cardHeader}>
                  <Text style={s.emoji}>{hobbyEmoji(plan.hobby)}</Text>
                  <View style={s.cardInfo}>
                    <Text style={s.cardTitle} numberOfLines={1}>{plan.hobby}</Text>
                    <Text style={s.cardLevel}>{plan.currentLevel} → {plan.targetLevel}</Text>
                  </View>
                  <ProgressRing pct={pct} />
                </View>
                
                <View style={s.divider} />
                
                <View style={s.cardFooter}>
                  <Text style={s.cardProgress}>{done} / {plan.chapters.length} chapters completed</Text>
                  <Text style={s.cardArrow}>→</Text>
                </View>
              </TouchableOpacity>
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

  card: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1.5, borderColor: Colors.grayLight, shadowColor: Colors.primary, shadowOpacity: 0.08, shadowRadius: 15, elevation: 4, overflow: 'hidden' },
  cardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryTint },
  activeIndicator: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 5, backgroundColor: Colors.primary },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  emoji: { fontSize: 40, marginRight: 16 },
  cardInfo: { flex: 1, paddingRight: 12 },
  cardTitle: { fontSize: 22, fontWeight: '900', color: Colors.dark, marginBottom: 4, letterSpacing: -0.5 },
  cardLevel: { fontSize: 12, fontWeight: '800', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1 },
  
  divider: { height: 1, backgroundColor: Colors.grayLight, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardProgress: { fontSize: 13, fontWeight: '600', color: Colors.gray },
  cardArrow: { fontSize: 20, color: Colors.primary, fontWeight: '700' },

  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryBg, padding: 20, borderRadius: 20, marginTop: 8, borderWidth: 1.5, borderColor: Colors.primaryLight, borderStyle: 'dashed' },
  addBtnIcon: { fontSize: 28, fontWeight: '400', color: Colors.primary, marginRight: 16, width: 40, textAlign: 'center' },
  addBtnTitle: { fontSize: 16, fontWeight: '800', color: Colors.primary, marginBottom: 2 },
  addBtnSub: { fontSize: 13, color: Colors.primary, opacity: 0.8 },
});
