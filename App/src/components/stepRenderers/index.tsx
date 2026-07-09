import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../theme/colors';

const SummaryStep = ({ step }: { step: any }) => (
  <View style={s.container}>
    <Text style={s.title}>Summary</Text>
    <Text style={s.sub}>What You'll Learn</Text>
    {step.whatYouWillLearn.map((item: string, i: number) => <Text key={i} style={s.text}>• {item}</Text>)}
    <Text style={[s.sub, { marginTop: 20 }]}>Key Concepts</Text>
    {step.keyConcepts.map((item: string, i: number) => <Text key={i} style={s.text}>• {item}</Text>)}
    <View style={s.card}>
      <Text style={s.cardTitle}>Outcome</Text>
      <Text style={s.text}>{step.expectedOutcome}</Text>
    </View>
  </View>
);

const VideoStep = ({ step }: { step: any }) => (
  <View style={s.container}>
    <Text style={s.title}>Video Instruction</Text>
    <Text style={s.text}>Recommended searches to find tutorials:</Text>
    {step.searchQueries.map((q: string, i: number) => (
      <View key={i} style={s.searchBox}>
        <Text style={s.searchIcon}>🔍</Text>
        <Text style={s.searchText}>"{q}"</Text>
      </View>
    ))}
  </View>
);

const ReflectionStep = ({ step, onNext }: { step: any; onNext: () => void }) => (
  <View style={s.container}>
    <Text style={s.title}>Reflection</Text>
    <Text style={s.text}>{step.question}</Text>
    {step.format === 'mcq' || step.format === 'trueFalse' ? (
      step.options?.map((opt: string, i: number) => (
        <View key={i} style={s.optionBox}>
          <Text style={s.optionText}>{opt}</Text>
        </View>
      ))
    ) : (
      <Text style={s.text}>(Short Answer expected)</Text>
    )}
  </View>
);

const ReadingStep = ({ step }: { step: any }) => (
  <View style={s.container}>
    <Text style={s.title}>Reading</Text>
    <Text style={s.text}>{step.content}</Text>
    
    {step.tips?.length > 0 && (
      <View style={[s.card, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
        <Text style={s.cardTitle}>💡 Tips</Text>
        {step.tips.map((t: string, i: number) => <Text key={i} style={s.text}>• {t}</Text>)}
      </View>
    )}

    {step.commonMistakes?.length > 0 && (
      <View style={[s.card, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
        <Text style={s.cardTitle}>⚠️ Common Mistakes</Text>
        {step.commonMistakes.map((t: string, i: number) => <Text key={i} style={s.text}>• {t}</Text>)}
      </View>
    )}
  </View>
);

const InteractiveStep = ({ step }: { step: any }) => (
  <View style={s.container}>
    <Text style={s.title}>Interactive Exercise</Text>
    <View style={s.card}>
      <Text style={s.cardTitle}>Type: {step.activityType}</Text>
      <Text style={s.text}>Dynamic activity goes here based on {step.activityType}</Text>
    </View>
  </View>
);

const QuizStep = ({ step }: { step: any }) => (
  <View style={s.container}>
    <Text style={s.title}>Quiz</Text>
    <Text style={s.text}>Passing Score: {step.passingScore}%</Text>
    <Text style={s.text}>{step.questions.length} questions to complete.</Text>
  </View>
);

const PracticeStep = ({ step }: { step: any }) => (
  <View style={s.container}>
    <Text style={s.title}>Practice</Text>
    <View style={s.card}>
      <Text style={s.cardTitle}>Task</Text>
      <Text style={s.text}>{step.task}</Text>
    </View>
    <View style={[s.card, { marginTop: 10 }]}>
      <Text style={s.cardTitle}>Expected Outcome</Text>
      <Text style={s.text}>{step.expectedOutcome}</Text>
    </View>
    <Text style={s.metaText}>⏱ Suggested time: {step.suggestedMinutes} minutes</Text>
  </View>
);

export const stepRenderers: Record<string, React.FC<any>> = {
  summary: SummaryStep,
  video: VideoStep,
  reflection: ReflectionStep,
  reading: ReadingStep,
  interactive: InteractiveStep,
  quiz: QuizStep,
  practice: PracticeStep,
};

const s = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.dark, marginBottom: 20 },
  sub: { fontSize: 16, fontWeight: '700', color: Colors.primary, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' },
  text: { fontSize: 16, color: Colors.gray, lineHeight: 24, marginBottom: 4 },
  card: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.grayLight, borderRadius: 12, padding: 16, marginTop: 16 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.dark, marginBottom: 8 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.grayLight, padding: 16, borderRadius: 12, marginBottom: 12 },
  searchIcon: { fontSize: 20, marginRight: 12 },
  searchText: { fontSize: 16, fontWeight: '600', color: Colors.primary },
  optionBox: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.grayLight, padding: 16, borderRadius: 12, marginBottom: 12 },
  optionText: { fontSize: 16, color: Colors.dark },
  metaText: { fontSize: 14, fontWeight: '600', color: Colors.primary, marginTop: 20, textAlign: 'center' }
});
