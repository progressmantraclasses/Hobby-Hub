import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChapterContent, ChapterMeta } from '../schemas/plan.schema';
import { usePlanStore } from '../store/planStore';
import { Colors } from '../theme/colors';
import { stepRenderers } from '../components/stepRenderers';

type RouteParams = { chapter: ChapterMeta; content: ChapterContent };

export default function ChapterFlowScreen() {
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { chapter, content } = route.params;
  const { setChapterStatus } = usePlanStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = content.steps;
  const currentStep = steps[currentStepIndex];
  const StepComponent = stepRenderers[currentStep.type] as React.FC<{ step: any; onNext: () => void }>;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Finished
      setChapterStatus(chapter.id, 'completed');
      navigation.replace('ChapterComplete', { chapter });
    }
  };

  const progress = (currentStepIndex + 1) / steps.length;

  return (
    <SafeAreaView style={styles.safe}>
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
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>{currentStep.type.toUpperCase()}</Text>
        </View>
        
        {StepComponent ? (
          <StepComponent step={currentStep} onNext={handleNext} />
        ) : (
          <Text style={styles.errorText}>No renderer for {currentStep.type}</Text>
        )}
      </ScrollView>

      {/* Default Continue button if the component doesn't render its own */}
      {currentStep.type !== 'quiz' && currentStep.type !== 'reflection' && currentStep.type !== 'interactive' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueBtn} onPress={handleNext}>
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: Colors.white, borderBottomWidth: 1, borderColor: Colors.grayLight },
  closeBtn: { padding: 8, marginRight: 8 },
  closeText: { fontSize: 20, color: Colors.gray, fontWeight: 'bold' },
  progressBar: { flex: 1, height: 8, backgroundColor: Colors.grayLight, borderRadius: 4, overflow: 'hidden', marginRight: 12 },
  progressFill: { height: 8, backgroundColor: Colors.primary, borderRadius: 4 },
  progressText: { fontSize: 13, fontWeight: '700', color: Colors.gray },
  content: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  stepBadge: { alignSelf: 'flex-start', backgroundColor: Colors.primaryBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 16 },
  stepBadgeText: { fontSize: 11, fontWeight: '800', color: Colors.primary, letterSpacing: 1 },
  errorText: { color: Colors.danger, fontSize: 16 },
  footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderColor: Colors.grayLight },
  continueBtn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 14, alignItems: 'center' },
  continueBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' }
});
