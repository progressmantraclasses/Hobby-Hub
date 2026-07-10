import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePlanStore } from '../store/planStore';
import { Colors } from '../theme/colors';
import { greeting, getLevel, getXpProgress, hobbyCompletion, XP_PER_LEVEL } from '../utils/xp';
import { generateChapter } from '../services/api';

const HOBBY_EMOJIS: Record<string, string> = {
  default: '🧩', guitar: '🎸', piano: '🎹', coding: '💻', programming: '💻',
  drawing: '🎨', painting: '🎨', yoga: '🧘', cooking: '🍳', reading: '📖',
  writing: '✍️', photography: '📷', chess: '♟️', dancing: '💃', singing: '🎤',
};
const hobbyEmoji = (h: string) => HOBBY_EMOJIS[h.toLowerCase()] ?? HOBBY_EMOJIS.default;

const SUGGESTED_HOBBIES = [
  { name: 'Guitar', icon: '🎸' },
  { name: 'Piano', icon: '🎹' },
  { name: 'Coding', icon: '💻' },
  { name: 'Yoga', icon: '🧘' },
  { name: 'Cooking', icon: '🍳' },
  { name: 'Photography', icon: '📷' },
  { name: 'Drawing', icon: '🎨' },
  { name: 'Chess', icon: '♟️' },
];

export default function HomeScreen() {
  const nav = useNavigation<NativeStackNavigationProp<any>>();
  const { xpTotal, streak, hobbies, activeHobbyId, setActiveHobby, setHobby } = usePlanStore();
  const level = getLevel(xpTotal);
  const xpProgress = getXpProgress(xpTotal);
  const xpToNext = XP_PER_LEVEL - (xpTotal % XP_PER_LEVEL);
  const hobbyList = Object.values(hobbies);
  const active = activeHobbyId ? hobbies[activeHobbyId] : hobbyList[0] ?? null;
  const nextChapter = active
    ? [...active.plan.chapters].sort((a, b) => a.order - b.order).find(c => {
      const st = active.chapterProgress[c.id] || 'pending';
      return st === 'pending' || st === 'in_progress';
    })
    : null;

  const startChapter = async () => {
    if (!nextChapter || !active) return;
    try {
      const content = await generateChapter(nextChapter.id);
      nav.navigate('ChapterFlow', { chapter: nextChapter, content });
    } catch { }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        <View style={s.topRow}>
          <View>
            <Text style={s.greet}>{greeting()} 👋</Text>
            <Text style={s.sub}>Ready to keep learning?</Text>
          </View>
          <View style={s.streakBadge}>
            <Text style={s.streakFire}>🔥</Text>
            <Text style={s.streakNum}>{streak}</Text>
          </View>
        </View>

        <View style={s.xpCard}>
          <View style={s.xpRow}>
            <Text style={s.xpLabel}>Level {level}</Text>
            <Text style={s.xpVal}>{xpTotal} XP</Text>
          </View>
          <View style={s.bar}>
            <View style={[s.barFill, { width: `${xpProgress * 100}%` as any }]} />
          </View>
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
            <TouchableOpacity
              style={s.startCard}
              onPress={() => nav.navigate('Learn', { screen: 'Hobby' })}
              activeOpacity={0.8}
            >
              <View style={s.startLeft}>
                <Text style={s.startTitle}>Something else?</Text>
                <Text style={s.startSub}>Type your own custom hobby to learn.</Text>
              </View>
              <Text style={s.startArrow}>→</Text>
            </TouchableOpacity>
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

            {hobbyList.length > 1 && (
              <View>
                <Text style={s.sectionTitle}>Your Hobbies</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hobbyRow}>
                  {hobbyList.map(({ plan, chapterProgress }) => {
                    const pct = hobbyCompletion(chapterProgress, plan.chapters);
                    const isActive = activeHobbyId === plan.hobby;
                    return (
                      <TouchableOpacity
                        key={plan.hobby}
                        style={[s.hobbyMini, isActive && s.hobbyMiniActive]}
                        onPress={() => setActiveHobby(plan.hobby)}
                        activeOpacity={0.8}
                      >
                        <Text style={s.hobbyMiniEmoji}>{hobbyEmoji(plan.hobby)}</Text>
                        <Text style={s.hobbyMiniName} numberOfLines={1}>{plan.hobby}</Text>
                        <Text style={s.hobbyMiniPct}>{Math.round(pct * 100)}%</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <TouchableOpacity
              style={s.startCard}
              onPress={() => nav.navigate('Learn', { screen: 'Hobby' })}
              activeOpacity={0.8}
            >
              <View style={s.startLeft}>
                <Text style={s.startTitle}>Learn a new hobby</Text>
                <Text style={s.startSub}>What's your level? Pick a skill and start.</Text>
              </View>
              <Text style={s.startArrow}>→</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { padding: 20, paddingBottom: 100 },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greet: { fontSize: 22, fontWeight: '800', color: Colors.dark },
  sub: { fontSize: 14, color: Colors.gray, marginTop: 2 },
  streakBadge: { backgroundColor: '#FEF3C7', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center', borderWidth: 1.5, borderColor: '#FDE68A' },
  streakFire: { fontSize: 18 },
  streakNum: { fontSize: 16, fontWeight: '900', color: '#92400E' },

  xpCard: { backgroundColor: Colors.white, borderRadius: 18, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: Colors.grayLight },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  xpLabel: { fontSize: 15, fontWeight: '800', color: Colors.dark },
  xpVal: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  bar: { height: 8, backgroundColor: Colors.grayLight, borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  barFill: { height: 8, backgroundColor: Colors.primary, borderRadius: 6 },
  xpNext: { fontSize: 12, color: Colors.gray, fontWeight: '600' },

  continueCard: { backgroundColor: Colors.primaryBg, borderRadius: 20, padding: 22, marginBottom: 20, borderWidth: 1, borderColor: Colors.primaryLight },
  continueLabel: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 1.5, marginBottom: 4 },
  continueHobby: { fontSize: 13, fontWeight: '700', color: Colors.gray, marginBottom: 4 },
  continueTitle: { fontSize: 18, fontWeight: '800', color: Colors.dark, marginBottom: 18, lineHeight: 24 },
  continueBtn: { backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignSelf: 'flex-start' },
  continueBtnText: { color: Colors.white, fontWeight: '800', fontSize: 14 },

  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.dark, marginBottom: 12 },
  hobbyRow: { paddingRight: 8, gap: 10 },
  hobbyMini: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, alignItems: 'center', minWidth: 90, borderWidth: 1.5, borderColor: Colors.grayLight },
  hobbyMiniActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  hobbyMiniEmoji: { fontSize: 24, marginBottom: 6 },
  hobbyMiniName: { fontSize: 11, fontWeight: '700', color: Colors.dark, marginBottom: 4, textAlign: 'center' },
  hobbyMiniPct: { fontSize: 12, fontWeight: '800', color: Colors.primary },

  startCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.white, borderRadius: 18, padding: 20, marginTop: 20, marginBottom: 8, borderWidth: 1.5, borderColor: Colors.primaryLight },
  startLeft: { flex: 1, paddingRight: 12 },
  startTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 4 },
  startSub: { fontSize: 13, color: Colors.gray, lineHeight: 18 },
  startArrow: { fontSize: 22, color: Colors.primary, fontWeight: '700' },

  emptyState: { marginTop: 10 },
  suggestionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  suggestionCard: { width: '48%', backgroundColor: Colors.white, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: Colors.grayLight },
  suggestionEmoji: { fontSize: 28, marginBottom: 8 },
  suggestionName: { fontSize: 14, fontWeight: '700', color: Colors.dark },
});

