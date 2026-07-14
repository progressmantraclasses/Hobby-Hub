import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChapterContent } from '../schemas/plan.schema';
import { usePlanStore } from '../store/planStore';
import { Colors } from '../theme/colors';
import { stepRenderers } from '../components/stepRenderers';
import { generateChapter } from '../services/api';
import { useAsyncTask } from '../hooks/useAsyncTask';
import { useThinkingAnimation } from '../hooks/useThinkingAnimation';
import { XP_PER_CHAPTER, XP_PER_LEVEL } from '../utils/xp';
import { RootStackParamList } from '../navigation/types';

export default function ChapterFlowScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ChapterFlow'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ChapterFlow'>>();
  const { chapter } = route.params;
  const { updateChapterProgress, addXp, activeHobbyId, hobbies } = usePlanStore();
  const hobbyId = route.params.hobbyId ?? activeHobbyId;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const fetchChapter = useCallback((): Promise<ChapterContent> => {
    const planId = hobbyId ? hobbies[hobbyId]?.plan.id : undefined;
    if (!planId) return Promise.reject(new Error('No active course found for this chapter'));
    return generateChapter(planId, chapter.id);
  }, [hobbyId, hobbies, chapter.id]);

  const { status, data: content, error, run } = useAsyncTask(fetchChapter);
  const loading = status === 'idle' || status === 'loading';
  const { pulseAnim, loadingText } = useThinkingAnimation(loading);

  useEffect(() => {
    run()
      .then(() => {
        if (hobbyId) {
          const currentStatus = hobbies[hobbyId]?.chapterProgress[chapter.id] || 'pending';
          if (currentStatus === 'pending') {
            updateChapterProgress(hobbyId, chapter.id, 'in_progress');
          }
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter.id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.loadingWrap}>
          <Animated.View style={[styles.loadingCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.loadingIcon}>✨</Text>
          </Animated.View>
          <Text style={styles.loadingTitle}>{loadingText}</Text>
          <Text style={styles.loadingSub}>Crafting interactive tasks for "{chapter.title}"</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !content) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.errorWrap}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Failed to load content</Text>
          <Text style={styles.errorSub}>{error || 'Something went wrong'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => run()} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const steps = content.steps;
  const currentStep = steps[currentStepIndex];
  const StepComponent = stepRenderers[currentStep.type] as React.FC<{ step: ChapterContent['steps'][number]; onNext: () => void }>;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      if (hobbyId) {
        const { xpTotal } = usePlanStore.getState();
        const prevLevel = Math.floor(xpTotal / XP_PER_LEVEL);
        updateChapterProgress(hobbyId, chapter.id, 'completed');
        addXp(XP_PER_CHAPTER);
        const newLevel = Math.floor((xpTotal + XP_PER_CHAPTER) / XP_PER_LEVEL);
        navigation.replace('ChapterComplete', { chapter, levelUp: newLevel > prevLevel, newLevel: newLevel + 1 });
      } else {
        navigation.replace('ChapterComplete', { chapter });
      }
    }
  };

  const progress = (currentStepIndex + 1) / steps.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {/* Header Progress */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{currentStepIndex + 1}/{steps.length}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {StepComponent ? (
          <StepComponent step={currentStep} onNext={handleNext} />
        ) : (
          <Text style={styles.errorText}>No renderer for {currentStep.type}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  closeBtn: { padding: 6, marginRight: 10 },
  closeText: { fontSize: 18, color: Colors.gray, fontWeight: 'bold' },
  progressBar: { flex: 1, height: 6, backgroundColor: Colors.grayLight, borderRadius: 3, overflow: 'hidden', marginRight: 12 },
  progressFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '800', color: Colors.gray },
  content: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  errorText: { color: Colors.danger, fontSize: 16 },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: Colors.surface },
  loadingCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.primaryLight },
  loadingIcon: { fontSize: 40 },
  loadingTitle: { fontSize: 22, fontWeight: '900', color: Colors.dark, marginTop: 24, marginBottom: 8, textAlign: 'center' },
  loadingSub: { fontSize: 14, color: Colors.gray, textAlign: 'center', lineHeight: 20, paddingHorizontal: 16 },

  errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: Colors.surface },
  errorIcon: { fontSize: 48, marginBottom: 16 },
  errorTitle: { fontSize: 20, fontWeight: '900', color: Colors.dark, marginBottom: 8, textAlign: 'center' },
  errorSub: { fontSize: 14, color: Colors.gray, textAlign: 'center', marginBottom: 24, paddingHorizontal: 16 },
  retryBtn: { backgroundColor: Colors.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 16, shadowColor: Colors.primary, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  retryBtnText: { color: Colors.white, fontSize: 15, fontWeight: '800' },
});
