import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlanStore } from '../store/planStore';
import { Colors } from '../theme/colors';
import { getLevel, getXpProgress, hobbyCompletion, XP_PER_LEVEL } from '../utils/xp';
import ScreenLoader from '../components/ScreenLoader';
import { hobbyEmoji } from '../constants/hobbies';
import { BADGES } from '../constants/badges';

export default function ProfileScreen() {
  const { xpTotal, streak, longestStreak, hobbies, userName, setUserName, hasHydrated } = usePlanStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);

  if (!hasHydrated) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScreenLoader />
      </SafeAreaView>
    );
  }

  const level = getLevel(xpTotal);
  const xpProgress = getXpProgress(xpTotal);
  const hobbyList = Object.values(hobbies);

  const totalChaptersDone = hobbyList.reduce((acc, { plan, chapterProgress }) =>
    acc + plan.chapters.filter(c => chapterProgress[c.id] === 'completed').length, 0);
  const hasFullyMastered = hobbyList.some(({ plan, chapterProgress }) =>
    plan.chapters.length > 0 && plan.chapters.every(c => chapterProgress[c.id] === 'completed'));

  const badgeStats = { totalChaptersDone, streak, xpTotal, hasFullyMastered };
  const badges = BADGES.map(b => ({ ...b, earned: b.isEarned(badgeStats) }));

  const handleSaveName = () => {
    if (tempName.trim()) setUserName(tempName.trim());
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={s.header}>
          <View style={s.avatarWrap}>
            <Text style={s.avatarEmoji}>🧑‍🚀</Text>
          </View>
          <View style={s.headerInfo}>
            {isEditing ? (
              <TextInput
                style={s.nameInput}
                value={tempName}
                onChangeText={setTempName}
                autoFocus
                onBlur={handleSaveName}
                onSubmitEditing={handleSaveName}
                returnKeyType="done"
                maxLength={20}
              />
            ) : (
              <View style={s.nameRow}>
                <Text style={s.username}>{userName}</Text>
                <TouchableOpacity onPress={() => { setTempName(userName); setIsEditing(true); }} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                  <Text style={s.editIcon}>✏️</Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={s.userTitle}>Hobby Enthusiast</Text>
          </View>
        </View>

        <View style={s.xpCard}>
          <View style={s.xpHeader}>
            <View>
              <Text style={s.levelText}>CURRENT LEVEL</Text>
              <Text style={s.levelNum}>Level {level}</Text>
            </View>
            <View style={s.xpBadge}>
              <Text style={s.xpTotal}>{xpTotal} XP</Text>
            </View>
          </View>
          <View style={s.barWrap}>
            <View style={[s.barFill, { width: `${xpProgress * 100}%` as any }]} />
          </View>
          <Text style={s.xpNext}>{XP_PER_LEVEL - (xpTotal % XP_PER_LEVEL)} XP to Level {level + 1}</Text>
        </View>

        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statEmoji}>🔥</Text>
            <Text style={s.statVal}>{streak}</Text>
            <Text style={s.statLbl}>Current Streak</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statBox}>
            <Text style={s.statEmoji}>🏅</Text>
            <Text style={s.statVal}>{longestStreak ?? streak}</Text>
            <Text style={s.statLbl}>Longest Streak</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statBox}>
            <Text style={s.statEmoji}>✅</Text>
            <Text style={s.statVal}>{totalChaptersDone}</Text>
            <Text style={s.statLbl}>Chapters Done</Text>
          </View>
        </View>

        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Achievements</Text>
          <Text style={s.sectionCount}>{badges.filter(b => b.earned).length}/{badges.length}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.badgeScroll}>
          {badges.map(b => (
            <View key={b.id} style={[s.badge, b.earned ? s.badgeEarned : s.badgeLocked]}>
              <View style={[s.badgeIconWrap, b.earned ? s.badgeIconWrapEarned : s.badgeIconWrapLocked]}>
                <Text style={s.badgeIcon}>{b.earned ? b.icon : '🔒'}</Text>
              </View>
              <Text style={[s.badgeTitle, !b.earned && s.badgeTextLocked]} numberOfLines={1}>{b.title}</Text>
              <Text style={[s.badgeDesc, !b.earned && s.badgeTextLocked]} numberOfLines={2}>{b.desc}</Text>
            </View>
          ))}
        </ScrollView>

        {hobbyList.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { marginTop: 16, marginBottom: 16 }]}>Course Progress</Text>
            {hobbyList.map(({ plan, chapterProgress }) => {
              const pct = hobbyCompletion(chapterProgress, plan.chapters);
              const done = plan.chapters.filter(c => chapterProgress[c.id] === 'completed').length;
              return (
                <View key={plan.hobby} style={s.hobbyRow}>
                  <Text style={s.hobbyEmoji}>{hobbyEmoji(plan.hobby)}</Text>
                  <View style={s.hobbyContent}>
                    <View style={s.hobbyInfo}>
                      <Text style={s.hobbyName}>{plan.hobby}</Text>
                      <Text style={s.hobbyMeta}>{done}/{plan.chapters.length}</Text>
                    </View>
                    <View style={s.hobbyBarWrap}>
                      <View style={[s.hobbyBarFill, { width: `${pct * 100}%` as any }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  scroll: { padding: 24, paddingBottom: 100 },
  
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  avatarWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.primaryLight },
  avatarEmoji: { fontSize: 32 },
  headerInfo: { flex: 1, marginLeft: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  username: { fontSize: 24, fontWeight: '900', color: Colors.dark, letterSpacing: -0.5, marginRight: 8 },
  editIcon: { fontSize: 16, opacity: 0.7 },
  nameInput: { fontSize: 24, fontWeight: '900', color: Colors.dark, letterSpacing: -0.5, padding: 0, margin: 0, borderBottomWidth: 1, borderBottomColor: Colors.primary },
  userTitle: { fontSize: 14, color: Colors.gray, fontWeight: '600', marginTop: 2 },

  xpCard: { backgroundColor: Colors.primaryBg, borderRadius: 24, padding: 24, marginBottom: 24, borderWidth: 1.5, borderColor: Colors.primaryLight, shadowColor: Colors.primary, shadowOpacity: 0.1, shadowRadius: 15, elevation: 4 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  levelText: { fontSize: 11, fontWeight: '800', color: Colors.primary, letterSpacing: 1.5, marginBottom: 4 },
  levelNum: { fontSize: 32, fontWeight: '900', color: Colors.dark },
  xpBadge: { backgroundColor: Colors.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: Colors.primaryLight },
  xpTotal: { fontSize: 14, fontWeight: '800', color: Colors.primary },
  barWrap: { width: '100%', height: 10, backgroundColor: Colors.white, borderRadius: 8, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: Colors.grayLight },
  barFill: { height: 10, backgroundColor: Colors.primary, borderRadius: 8 },
  xpNext: { fontSize: 13, color: Colors.gray, fontWeight: '600', textAlign: 'center' },

  statsRow: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 20, paddingVertical: 20, marginBottom: 32, borderWidth: 1, borderColor: Colors.grayLight, shadowColor: Colors.black, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  statBox: { flex: 1, alignItems: 'center' },
  statEmoji: { fontSize: 24, marginBottom: 8 },
  statVal: { fontSize: 20, fontWeight: '900', color: Colors.dark, marginBottom: 2 },
  statLbl: { fontSize: 11, color: Colors.gray, fontWeight: '700', textTransform: 'uppercase' },
  statDiv: { width: 1, backgroundColor: Colors.grayLight },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: Colors.dark, letterSpacing: -0.5 },
  sectionCount: { fontSize: 14, fontWeight: '700', color: Colors.primary },

  badgeScroll: { paddingRight: 24, paddingBottom: 32, gap: 12, marginHorizontal: -24, paddingHorizontal: 24 },
  badge: { width: 140, borderRadius: 20, padding: 16, alignItems: 'center' },
  badgeEarned: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.primaryLight, shadowColor: Colors.primary, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  badgeLocked: { backgroundColor: Colors.grayLight, opacity: 0.6 },
  badgeIconWrap: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  badgeIconWrapEarned: { backgroundColor: Colors.primaryBg },
  badgeIconWrapLocked: { backgroundColor: Colors.overlaySubtle },
  badgeIcon: { fontSize: 28 },
  badgeTitle: { fontSize: 14, fontWeight: '800', color: Colors.dark, marginBottom: 4, textAlign: 'center' },
  badgeDesc: { fontSize: 11, color: Colors.gray, textAlign: 'center', lineHeight: 16 },
  badgeTextLocked: { color: Colors.gray },

  hobbyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.grayLight, shadowColor: Colors.black, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  hobbyEmoji: { fontSize: 32, marginRight: 16 },
  hobbyContent: { flex: 1 },
  hobbyInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  hobbyName: { fontSize: 16, fontWeight: '800', color: Colors.dark },
  hobbyMeta: { fontSize: 13, fontWeight: '700', color: Colors.gray },
  hobbyBarWrap: { height: 8, backgroundColor: Colors.grayLight, borderRadius: 6, overflow: 'hidden' },
  hobbyBarFill: { height: 8, backgroundColor: Colors.primary, borderRadius: 6 },
});
