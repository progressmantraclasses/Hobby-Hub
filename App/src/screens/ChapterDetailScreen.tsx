import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePlanStore, ChapterStatus } from '../store/planStore';
import { ChapterMeta } from '../schemas/plan.schema';
import { Colors } from '../theme/colors';

const STATUS_LABELS: Record<ChapterStatus, string> = {
  pending:     'Not Started',
  in_progress: 'In Progress',
  completed:   'Completed',
  skipped:     'Skipped',
};

const STATUS_COLORS: Record<ChapterStatus, { bg: string; text: string }> = {
  pending:     { bg: Colors.grayLight,   text: Colors.gray },
  in_progress: { bg: Colors.primaryCard, text: Colors.primary },
  completed:   { bg: '#D1FAE5',          text: Colors.success },
  skipped:     { bg: '#FEE2E2',          text: Colors.danger },
};

export default function ChapterDetailScreen() {
  const route = useRoute<RouteProp<any, 'ChapterDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { chapter } = route.params as { chapter: ChapterMeta };
  const { activeHobbyId, hobbies } = usePlanStore();
  const chapterProgress = activeHobbyId ? hobbies[activeHobbyId]?.chapterProgress ?? {} : {};

  const currentStatus: ChapterStatus = chapterProgress[chapter.id] || 'pending';
  const { bg, text } = STATUS_COLORS[currentStatus];

  const handleStart = () => {
    navigation.navigate('ChapterFlow', { chapter });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={[styles.pill, { backgroundColor: bg }]}>
          <Text style={[styles.pillText, { color: text }]}>{STATUS_LABELS[currentStatus]}</Text>
        </View>

        <Text style={styles.order}>Chapter {chapter.order}</Text>
        <Text style={styles.title}>{chapter.title}</Text>
        <Text style={styles.summary}>{chapter.summary}</Text>
        <Text style={styles.meta}>⏱ {chapter.estimatedMinutes} minutes • +100 XP</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.85}>
          <Text style={styles.startBtnText}>{currentStatus === 'completed' ? 'Review Chapter' : 'Start Chapter'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  content: { padding: 24, paddingBottom: 40 },

  pill: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 20 },
  pillText: { fontSize: 13, fontWeight: '700' },

  order: { fontSize: 12, fontWeight: '800', color: Colors.primaryMid, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.dark, lineHeight: 34, marginBottom: 14 },
  summary: { fontSize: 15, color: '#475569', lineHeight: 24, marginBottom: 16 },
  meta: { fontSize: 13, color: Colors.gray, fontWeight: '600', marginBottom: 28 },
  error: { color: Colors.danger, marginTop: 10, fontWeight: '600' },

  footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderColor: Colors.grayLight },
  startBtn: { backgroundColor: Colors.primary, padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  startBtnText: { color: Colors.white, fontSize: 17, fontWeight: '800' }
});
