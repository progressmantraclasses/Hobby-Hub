import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
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
  const navigation = useNavigation();
  const { chapter } = route.params as { chapter: ChapterMeta };
  const { setChapterStatus, chapterProgress } = usePlanStore();
  const [skipModalVisible, setSkipModalVisible] = useState(false);
  const [skipReason, setSkipReason] = useState('');

  const currentStatus: ChapterStatus = chapterProgress[chapter.id] || 'pending';
  const { bg, text } = STATUS_COLORS[currentStatus];

  const handleAction = (status: ChapterStatus) => {
    if (status === 'skipped') { setSkipModalVisible(true); return; }
    setChapterStatus(chapter.id, status);
    if (status === 'completed') navigation.goBack();
  };

  const confirmSkip = () => {
    if (!skipReason.trim()) { Alert.alert('Reason required', 'Please tell us why you want to skip.'); return; }
    setChapterStatus(chapter.id, 'skipped');
    setSkipModalVisible(false);
    navigation.goBack();
  };

  const ACTIONS: { status: ChapterStatus; label: string; bg: string }[] = [
    { status: 'in_progress', label: 'Mark as In Progress', bg: Colors.warning },
    { status: 'completed',   label: 'Mark as Completed ✓', bg: Colors.success },
    { status: 'skipped',     label: 'Skip This Chapter',   bg: Colors.danger  },
  ].filter((a) => a.status !== currentStatus);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Status pill */}
        <View style={[styles.pill, { backgroundColor: bg }]}>
          <Text style={[styles.pillText, { color: text }]}>{STATUS_LABELS[currentStatus]}</Text>
        </View>

        <Text style={styles.order}>Chapter {chapter.order}</Text>
        <Text style={styles.title}>{chapter.title}</Text>
        <Text style={styles.summary}>{chapter.summary}</Text>
        <Text style={styles.meta}>⏱ {chapter.estimatedMinutes} minutes</Text>

        <View style={styles.divider} />
        <Text style={styles.actionsLabel}>UPDATE YOUR PROGRESS</Text>

        {ACTIONS.map((a) => (
          <TouchableOpacity key={a.status} style={[styles.actionBtn, { backgroundColor: a.bg }]} onPress={() => handleAction(a.status)} activeOpacity={0.82}>
            <Text style={styles.actionBtnText}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={skipModalVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Why are you skipping?</Text>
            <Text style={styles.modalSub}>This helps improve your plan suggestions.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Already know this, Not relevant…"
              placeholderTextColor={Colors.gray}
              value={skipReason}
              onChangeText={setSkipReason}
              multiline numberOfLines={3}
            />
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSkipModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmSkip}>
                <Text style={styles.confirmText}>Skip Chapter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  divider: { height: 1, backgroundColor: Colors.grayLight, marginBottom: 20 },
  actionsLabel: { fontSize: 11, fontWeight: '800', color: Colors.gray, letterSpacing: 1.5, marginBottom: 14 },

  actionBtn: { padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  actionBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.dark, marginBottom: 6 },
  modalSub: { fontSize: 14, color: Colors.gray, marginBottom: 16 },
  modalInput: { borderWidth: 1.5, borderColor: Colors.grayLight, borderRadius: 12, padding: 14, fontSize: 15, color: Colors.dark, minHeight: 80, textAlignVertical: 'top', marginBottom: 20 },
  modalRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: Colors.grayLight, padding: 14, borderRadius: 12, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600', color: Colors.gray },
  confirmBtn: { flex: 1, backgroundColor: Colors.danger, padding: 14, borderRadius: 12, alignItems: 'center' },
  confirmText: { fontSize: 15, fontWeight: '700', color: Colors.white },
});
