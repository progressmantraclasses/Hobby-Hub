import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Colors } from '../../theme/colors';

const SummaryStep = ({ step, onNext }: { step: any; onNext?: () => void }) => (
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
    {onNext && (
      <View style={s.actionRow}>
        <TouchableOpacity style={s.skipBtn} onPress={onNext}>
          <Text style={s.skipBtnText}>Skip Step</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.continueBtn, s.flexBtn]} onPress={onNext}>
          <Text style={s.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const VideoStep = ({ step, onNext }: { step: any; onNext?: () => void }) => (
  <View style={s.container}>
    <Text style={s.title}>Video Instruction</Text>
    
    {step.video ? (
      <View style={s.videoWrapper}>
        <YoutubePlayer height={220} videoId={step.video.videoId} />
        <View style={s.videoMeta}>
          <Text style={s.cardTitle}>{step.video.title}</Text>
          <Text style={s.videoChannel}>{step.video.channelTitle}</Text>
          {step.videoSummary ? (
            <Text style={[s.text, { marginTop: 10 }]}>{step.videoSummary}</Text>
          ) : null}
        </View>
      </View>
    ) : (
      <>
        <Text style={s.text}>Recommended searches to find tutorials:</Text>
        {step.searchQueries?.map((q: string, i: number) => (
          <View key={i} style={s.searchBox}>
            <Text style={s.searchIcon}>🔍</Text>
            <Text style={s.searchText}>"{q}"</Text>
          </View>
        ))}
      </>
    )}
    
    {onNext && (
      <View style={s.actionRow}>
        <TouchableOpacity style={s.skipBtn} onPress={onNext}>
          <Text style={s.skipBtnText}>Skip Video</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.continueBtn, s.flexBtn]} onPress={onNext}>
          <Text style={s.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const ReflectionStep = ({ step, onNext }: { step: any; onNext: () => void }) => {
  const [answer, setAnswer] = useState('');
  const [selectedOpt, setSelectedOpt] = useState('');

  return (
    <View style={s.container}>
      <Text style={s.title}>Reflection</Text>
      <Text style={s.text}>{step.question}</Text>
      
      <View style={{ marginTop: 20, marginBottom: 20 }}>
        {step.format === 'mcq' || step.format === 'trueFalse' ? (
          step.options?.map((opt: string, i: number) => (
            <TouchableOpacity 
              key={i} 
              style={[s.optionBox, selectedOpt === opt && { borderColor: Colors.primary, backgroundColor: Colors.primaryBg }]}
              onPress={() => setSelectedOpt(opt)}
            >
              <Text style={[s.optionText, selectedOpt === opt && { color: Colors.primary, fontWeight: '700' }]}>{opt}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <TextInput 
            style={s.textInput}
            multiline 
            placeholder="Type your answer here..."
            placeholderTextColor={Colors.gray}
            value={answer}
            onChangeText={setAnswer}
          />
        )}
      </View>

      <View style={s.actionRow}>
        <TouchableOpacity style={s.skipBtn} onPress={onNext}>
          <Text style={s.skipBtnText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[s.continueBtn, s.flexBtn, !(answer.trim() || selectedOpt) && s.disabledBtn]} 
          onPress={onNext}
          disabled={!(answer.trim() || selectedOpt)}
        >
          <Text style={s.continueBtnText}>Submit & Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ReadingStep = ({ step, onNext }: { step: any; onNext?: () => void }) => (
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
    
    {onNext && (
      <View style={s.actionRow}>
        <TouchableOpacity style={s.skipBtn} onPress={onNext}>
          <Text style={s.skipBtnText}>Skip Reading</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.continueBtn, s.flexBtn]} onPress={onNext}>
          <Text style={s.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const InteractiveStep = ({ step, onNext }: { step: any; onNext: () => void }) => {
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  return (
    <View style={s.container}>
      <Text style={s.title}>Interactive Exercise</Text>
      
      {step.activityType === 'flashcard' && step.cards ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {step.cards.map((c: any, i: number) => {
            const isFlipped = flippedIndex === i;
            return (
              <TouchableOpacity
                key={i}
                style={[s.flashcard, isFlipped && s.flashcardFlipped]}
                activeOpacity={0.8}
                onPress={() => setFlippedIndex(isFlipped ? null : i)}
              >
                <Text style={[s.flashcardText, isFlipped && s.flashcardTextFlipped]}>
                  {isFlipped ? c.back : c.front}
                </Text>
                <Text style={s.flashcardHint}>
                  {isFlipped ? 'Tap to see question' : 'Tap to reveal answer'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View style={s.card}>
          <Text style={s.cardTitle}>Type: {step.activityType}</Text>
          <Text style={s.text}>Dynamic activity goes here based on {step.activityType}</Text>
        </View>
      )}
      
      <View style={s.actionRow}>
        <TouchableOpacity style={s.skipBtn} onPress={onNext}>
          <Text style={s.skipBtnText}>Skip Step</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.continueBtn, s.flexBtn]} onPress={onNext}>
          <Text style={s.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const QuizStep = ({ step, onNext }: { step: any; onNext?: () => void }) => (
  <View style={s.container}>
    <Text style={s.title}>Quiz</Text>
    <Text style={s.text}>Passing Score: {step.passingScore}%</Text>
    <Text style={s.text}>{step.questions.length} questions to complete.</Text>
    {onNext && (
      <View style={s.actionRow}>
        <TouchableOpacity style={s.skipBtn} onPress={onNext}>
          <Text style={s.skipBtnText}>Skip Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.continueBtn, s.flexBtn]} onPress={onNext}>
          <Text style={s.continueBtnText}>Start Quiz</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const PracticeStep = ({ step, onNext }: { step: any; onNext?: () => void }) => (
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
    {onNext && (
      <View style={s.actionRow}>
        <TouchableOpacity style={s.skipBtn} onPress={onNext}>
          <Text style={s.skipBtnText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.continueBtn, s.flexBtn]} onPress={onNext}>
          <Text style={s.continueBtnText}>Finish Practice</Text>
        </TouchableOpacity>
      </View>
    )}
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
  metaText: { fontSize: 14, fontWeight: '600', color: Colors.primary, marginTop: 20, textAlign: 'center' },
  videoWrapper: { backgroundColor: Colors.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.grayLight, marginTop: 16 },
  videoMeta: { padding: 16 },
  videoChannel: { fontSize: 13, color: Colors.gray, fontWeight: '600', marginTop: 4 },
  textInput: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.grayLight, borderRadius: 12, padding: 16, fontSize: 16, color: Colors.dark, minHeight: 120, textAlignVertical: 'top' },
  
  actionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 'auto', paddingTop: 20, gap: 12 },
  continueBtn: { backgroundColor: Colors.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
  flexBtn: { flex: 1 },
  disabledBtn: { backgroundColor: Colors.grayLight },
  continueBtnText: { color: Colors.white, fontSize: 17, fontWeight: '800' },
  
  skipBtn: { padding: 18, borderRadius: 16, alignItems: 'center', backgroundColor: Colors.primaryBg, borderWidth: 1, borderColor: Colors.primary + '30' },
  skipBtnText: { color: Colors.primary, fontSize: 16, fontWeight: '700' },
  
  flashcard: { backgroundColor: Colors.white, minHeight: 180, borderRadius: 16, padding: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.primaryLight, marginBottom: 16, shadowColor: Colors.primary, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  flashcardFlipped: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  flashcardText: { fontSize: 20, fontWeight: '700', color: Colors.dark, textAlign: 'center' },
  flashcardTextFlipped: { color: Colors.white },
  flashcardHint: { fontSize: 12, color: Colors.gray, marginTop: 20, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' }
});
