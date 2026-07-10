import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChapterContent, ChapterMeta } from '../schemas/plan.schema';
import { usePlanStore } from '../store/planStore';
import { Colors } from '../theme/colors';
import { stepRenderers } from '../components/stepRenderers';
import { generateChapter } from '../services/api';

type RouteParams = { chapter: ChapterMeta; content?: ChapterContent };

export default function ChapterFlowScreen() {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { chapter } = route.params;
  const { updateChapterProgress, addXp, activeHobbyId, hobbies } = usePlanStore();

  const [content, setContent] = useState<ChapterContent | null>(route.params.content || null);
  const [loading, setLoading] = useState(!route.params.content);
  const [error, setError] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [loadingText, setLoadingText] = useState('Thinking...');

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [loading]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      const texts = ['Thinking...', 'Preparing...', 'Customizing...', 'Generating...'];
      let i = 0;
      setLoadingText(texts[i]);
      interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setLoadingText(texts[i]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await generateChapter(chapter.id);
      setContent(data);

      // Update progress to in_progress if currently pending
      if (activeHobbyId) {
        const currentStatus = hobbies[activeHobbyId]?.chapterProgress[chapter.id] || 'pending';
        if (currentStatus === 'pending') {
          updateChapterProgress(activeHobbyId, chapter.id, 'in_progress');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load chapter content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!content) {
      fetchContent();
    } else {
      // If content was pre-passed, check if status needs updating
      if (activeHobbyId) {
        const currentStatus = hobbies[activeHobbyId]?.chapterProgress[chapter.id] || 'pending';
        if (currentStatus === 'pending') {
          updateChapterProgress(activeHobbyId, chapter.id, 'in_progress');
        }
      }
    }
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
          <TouchableOpacity style={styles.retryBtn} onPress={fetchContent} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const steps = content.steps;
  const currentStep = steps[currentStepIndex];
  const StepComponent = stepRenderers[currentStep.type] as React.FC<{ step: any; onNext: () => void }>;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      if (activeHobbyId) {
        const { xpTotal } = usePlanStore.getState();
        const prevLevel = Math.floor(xpTotal / 200);
        updateChapterProgress(activeHobbyId, chapter.id, 'completed');
        addXp(50);
        const newLevel = Math.floor((xpTotal + 50) / 200);
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
  stepBadge: { alignSelf: 'flex-start', backgroundColor: Colors.primaryBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 16 },
  stepBadgeText: { fontSize: 11, fontWeight: '800', color: Colors.primary, letterSpacing: 1 },
  errorText: { color: Colors.danger, fontSize: 16 },
  footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderColor: Colors.grayLight },
  continueBtn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 14, alignItems: 'center' },
  continueBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },

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
