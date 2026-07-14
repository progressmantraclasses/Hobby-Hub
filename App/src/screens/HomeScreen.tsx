import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { usePlanStore } from '../store/planStore';
import { Colors } from '../theme/colors';
import { greeting, getLevel, getXpProgress, hobbyCompletion, findNextChapter, XP_PER_LEVEL } from '../utils/xp';
import ScreenLoader from '../components/ScreenLoader';
import { hobbyEmoji, SUGGESTED_HOBBIES } from '../constants/hobbies';
import UserHeader from '../components/UserHeader';
import ProgressBar from '../components/ProgressBar';
import HobbyMiniCard from '../components/HobbyMiniCard';
import QuestCard from '../components/QuestCard';
import { MainTabScreenNavigationProp } from '../navigation/types';

export default function HomeScreen() {
  const nav = useNavigation<MainTabScreenNavigationProp<'Home'>>();
  const { xpTotal, streak, hobbies, activeHobbyId, setActiveHobby, setHobby, userName, updateStreak, hasHydrated } = usePlanStore();

  React.useEffect(() => {
    if (!hasHydrated) return;
    updateStreak();

    if (!activeHobbyId) {
      const firstHobby = Object.values(hobbies)[0];
      if (firstHobby) setActiveHobby(firstHobby.plan.hobby);
      return;
    }

    const currentHobby = hobbies[activeHobbyId];
    if (currentHobby) {
      const isComplete = hobbyCompletion(currentHobby.chapterProgress, currentHobby.plan.chapters) === 1;
      if (isComplete) {
        const incomplete = Object.values(hobbies).find(h => hobbyCompletion(h.chapterProgress, h.plan.chapters) < 1);
        if (incomplete) {
          setActiveHobby(incomplete.plan.hobby);
        }
      }
    }
  }, [hasHydrated, activeHobbyId, hobbies, setActiveHobby, updateStreak]);

  if (!hasHydrated) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScreenLoader />
      </SafeAreaView>
    );
  }

  const level = getLevel(xpTotal);
  const xpProgress = getXpProgress(xpTotal);
  const xpToNext = XP_PER_LEVEL - (xpTotal % XP_PER_LEVEL);
  const hobbyList = Object.values(hobbies);
  const incompleteHobbies = hobbyList.filter(h => hobbyCompletion(h.chapterProgress, h.plan.chapters) < 1);
  const active = activeHobbyId ? hobbies[activeHobbyId] : hobbyList[0] ?? null;
  const nextChapter = active ? findNextChapter(active.chapterProgress, active.plan.chapters) : null;

  const startChapter = () => {
    if (!nextChapter || !active) return;
    nav.navigate('ChapterFlow', { chapter: nextChapter, hobbyId: active.plan.hobby });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <UserHeader userName={userName} streak={streak} greetingText={`${greeting()} 👋`} />

        <View style={s.xpCard}>
          <View style={s.xpRow}>
            <Text style={s.xpLabel}>Level {level}</Text>
            <Text style={s.xpVal}>{xpTotal} XP</Text>
          </View>
          <ProgressBar progress={xpProgress} style={{ marginBottom: 8 }} />
          <Text style={s.xpNext}>{xpToNext} XP to Level {level + 1}</Text>
        </View>

        {hobbyList.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.sectionTitle}>Pick a hobby to start</Text>
            <View style={s.suggestionGrid}>
              {SUGGESTED_HOBBIES.map((h) => (
                <TouchableOpacity
                  key={h.name}
                  style={s.suggestionCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    setHobby(h.name);
                    nav.navigate('Learn', { screen: 'Level' });
                  }}
                >
                  <Text style={s.suggestionEmoji}>{h.icon}</Text>
                  <Text style={s.suggestionName}>{h.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <QuestCard
              badgeText="CUSTOM QUEST"
              title="Create Custom Hobby 💡"
              subtitle="Type your own custom hobby and generate a customized roadmap."
              icon="⚡"
              onPress={() => nav.navigate('Learn', { screen: 'Hobby' })}
            />
          </View>
        ) : (
          <>
            {active && nextChapter ? (
              <View style={s.continueCard}>
                <Text style={s.continueLabel}>CONTINUE LEARNING</Text>
                <Text style={s.continueHobby}>{active.plan.hobby}</Text>
                <Text style={s.continueTitle} numberOfLines={2}>{nextChapter.title}</Text>
                <TouchableOpacity style={s.continueBtn} onPress={startChapter} activeOpacity={0.85}>
                  <Text style={s.continueBtnText}>Start Chapter →</Text>
                </TouchableOpacity>
              </View>
            ) : active ? (
              <View style={s.continueCard}>
                <Text style={s.continueLabel}>ALL DONE 🎉</Text>
                <Text style={s.continueTitle}>{active.plan.hobby} is fully complete!</Text>
              </View>
            ) : null}

            {incompleteHobbies.length > 1 && (
              <View>
                <Text style={s.sectionTitle}>Your Hobbies</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hobbyRow}>
                  {incompleteHobbies.map(({ plan, chapterProgress }) => {
                    const pct = hobbyCompletion(chapterProgress, plan.chapters);
                    const isActive = activeHobbyId === plan.hobby;
                    return (
                      <HobbyMiniCard
                        key={plan.hobby}
                        hobbyName={plan.hobby}
                        emoji={hobbyEmoji(plan.hobby)}
                        percentage={pct * 100}
                        isActive={isActive}
                        onPress={() => setActiveHobby(plan.hobby)}
                      />
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <QuestCard
              badgeText="NEW QUEST"
              title="Unlock a New Hobby 🎯"
              subtitle="Pick another skill, set your commitment, and start leveling up."
              icon="🚀"
              onPress={() => nav.navigate('Learn', { screen: 'Hobby' })}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { padding: 20, paddingBottom: 100 },

  xpCard: { backgroundColor: Colors.white, borderRadius: 18, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: Colors.grayLight },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  xpLabel: { fontSize: 15, fontWeight: '800', color: Colors.dark },
  xpVal: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  xpNext: { fontSize: 12, color: Colors.gray, fontWeight: '600' },

  continueCard: { backgroundColor: Colors.primaryBg, borderRadius: 20, padding: 22, marginBottom: 20, borderWidth: 1, borderColor: Colors.primaryLight },
  continueLabel: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 1.5, marginBottom: 4 },
  continueHobby: { fontSize: 13, fontWeight: '700', color: Colors.gray, marginBottom: 4 },
  continueTitle: { fontSize: 18, fontWeight: '800', color: Colors.dark, marginBottom: 18, lineHeight: 24 },
  continueBtn: { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignSelf: 'flex-start' },
  continueBtnText: { color: Colors.white, fontWeight: '800', fontSize: 14 },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.dark, marginBottom: 12 },
  hobbyRow: { paddingRight: 8, gap: 10 },

  emptyState: { marginTop: 10 },
  suggestionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  suggestionCard: { width: '48%', backgroundColor: Colors.white, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: Colors.grayLight },
  suggestionEmoji: { fontSize: 28, marginBottom: 8 },
  suggestionName: { fontSize: 14, fontWeight: '700', color: Colors.dark },
});

