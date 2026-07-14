import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Colors } from '../../theme/colors';
import { LearningStep } from '../../schemas/plan.schema';

type SummaryStepData = Extract<LearningStep, { type: 'summary' }>;
type VideoStepData = Extract<LearningStep, { type: 'video' }>;
type ReflectionStepData = Extract<LearningStep, { type: 'reflection' }>;
type ReadingStepData = Extract<LearningStep, { type: 'reading' }>;
type InteractiveStepData = Extract<LearningStep, { type: 'interactive' }>;
type QuizStepData = Extract<LearningStep, { type: 'quiz' }>;
type PracticeStepData = Extract<LearningStep, { type: 'practice' }>;

const SummaryStep = ({ step, onNext }: { step: SummaryStepData; onNext?: () => void }) => (
  <View style={s.container}>
    <Text style={s.title}>Summary</Text>
    <Text style={s.sub}>What You'll Learn</Text>
    {step.whatYouWillLearn.map((item, i) => <Text key={i} style={s.text}>• {item}</Text>)}
    <Text style={[s.sub, s.mt20]}>Key Concepts</Text>
    {step.keyConcepts.map((item, i) => <Text key={i} style={s.text}>• {item}</Text>)}
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

const VideoStep = ({ step, onNext }: { step: VideoStepData; onNext?: () => void }) => (
  <View style={s.container}>
    <Text style={s.title}>Video Instruction</Text>

    {step.video ? (
      <View style={s.videoWrapper}>
        <YoutubePlayer height={220} videoId={step.video.videoId} />
        <View style={s.videoMeta}>
          <Text style={s.cardTitle}>{step.video.title}</Text>
          <Text style={s.videoChannel}>{step.video.channelTitle}</Text>
          {step.videoSummary ? (
            <Text style={[s.text, s.mt10]}>{step.videoSummary}</Text>
          ) : null}
        </View>
      </View>
    ) : (
      <>
        <Text style={s.text}>Recommended searches to find tutorials:</Text>
        {step.searchQueries?.map((q, i) => (
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

const ReflectionStep = ({ step, onNext }: { step: ReflectionStepData; onNext: () => void }) => {
  const [answer, setAnswer] = useState('');
  const [selectedOpt, setSelectedOpt] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (isSubmitted) {
      onNext();
      return;
    }

    if (step.format === 'mcq' || step.format === 'trueFalse') {
      const correct = selectedOpt.trim().toLowerCase() === step.correctAnswer?.trim().toLowerCase();
      setIsCorrect(correct);
    } else {
      setIsCorrect(true);
    }
    setIsSubmitted(true);
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Reflection</Text>
      <Text style={s.text}>{step.question}</Text>

      <View style={s.my20}>
        {step.format === 'mcq' || step.format === 'trueFalse' ? (
          step.options?.map((opt, i) => {
            const isSelected = selectedOpt === opt;
            const isAnswerCorrect = opt.trim().toLowerCase() === step.correctAnswer?.trim().toLowerCase();

            // Custom dynamic styles based on submission state
            const optionStyle: (object | undefined)[] = [s.optionBox];
            const optionTextStyle: (object | undefined)[] = [s.optionText];

            if (isSelected) {
              if (isSubmitted) {
                if (isCorrect) {
                  optionStyle.push({ borderColor: Colors.success, backgroundColor: Colors.successBg });
                  optionTextStyle.push({ color: Colors.success, fontWeight: '700' });
                } else {
                  optionStyle.push({ borderColor: Colors.danger, backgroundColor: Colors.dangerBg });
                  optionTextStyle.push({ color: Colors.danger, fontWeight: '700' });
                }
              } else {
                optionStyle.push({ borderColor: Colors.primary, backgroundColor: Colors.primaryBg });
                optionTextStyle.push({ color: Colors.primary, fontWeight: '700' });
              }
            } else if (isSubmitted && isAnswerCorrect) {
              // Highlight the correct answer if the user picked wrong
              optionStyle.push({ borderColor: Colors.success, borderWidth: 2, backgroundColor: Colors.successBg });
              optionTextStyle.push({ color: Colors.success, fontWeight: '700' });
            }

            return (
              <TouchableOpacity
                key={i}
                style={optionStyle}
                onPress={() => !isSubmitted && setSelectedOpt(opt)}
                activeOpacity={isSubmitted ? 1 : 0.7}
              >
                <Text style={optionTextStyle}>{opt}</Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <TextInput
            style={[s.textInput, isSubmitted && { backgroundColor: Colors.grayLight, color: Colors.gray }]}
            multiline
            editable={!isSubmitted}
            placeholder="Type your answer here..."
            placeholderTextColor={Colors.gray}
            value={answer}
            onChangeText={setAnswer}
          />
        )}
      </View>

      {/* Answer feedback banner */}
      {isSubmitted && (
        <View style={[
          s.feedbackBanner,
          isCorrect ? { backgroundColor: Colors.successBg, borderColor: Colors.success } : { backgroundColor: Colors.dangerBg, borderColor: Colors.danger }
        ]}>
          <Text style={[s.feedbackTitle, isCorrect ? { color: Colors.success } : { color: Colors.danger }]}>
            {isCorrect ? '🎉 Correct Answer!' : '❌ Incorrect Answer'}
          </Text>
          {!isCorrect && step.correctAnswer && (
            <Text style={s.feedbackDesc}>
              The correct answer is: <Text style={s.bold}>{step.correctAnswer}</Text>
            </Text>
          )}
          {step.format === 'shortAnswer' && step.correctAnswer && (
            <Text style={s.feedbackDesc}>
              Suggested Reference: <Text style={s.semiBold}>{step.correctAnswer}</Text>
            </Text>
          )}
        </View>
      )}

      <View style={s.actionRow}>
        {!isSubmitted && (
          <TouchableOpacity style={s.skipBtn} onPress={onNext}>
            <Text style={s.skipBtnText}>Skip</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            s.continueBtn,
            s.flexBtn,
            !(answer.trim() || selectedOpt) && !isSubmitted && s.disabledBtn
          ]}
          onPress={handleSubmit}
          disabled={!(answer.trim() || selectedOpt) && !isSubmitted}
        >
          <Text style={s.continueBtnText}>
            {isSubmitted ? 'Continue →' : 'Check Answer'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const cleanContent = (text: string) => {
  if (!text) return '';
  const markers = [
    /tips\s*:/i,
    /common\s*mistakes\s*:/i,
    /image\s*prompts?\s*:/i,
    /###\s*tips/i,
    /###\s*common\s*mistakes/i,
    /###\s*image\s*prompts?/i,
    /\*\*tips\*\*:/i,
    /\*\*common\s*mistakes\*\*:/i,
    /\*\*image\s*prompts?\*\*:/i,
  ];

  let cleaned = text;
  for (const marker of markers) {
    const index = cleaned.search(marker);
    if (index !== -1) {
      cleaned = cleaned.substring(0, index);
    }
  }
  return cleaned.trim();
};

const ReadingStep = ({ step, onNext }: { step: ReadingStepData; onNext?: () => void }) => {
  return (
    <View style={s.container}>
      <Text style={s.title}>Reading</Text>
      <Text style={s.text}>{cleanContent(step.content)}</Text>

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
};

const InteractiveStep = ({ step, onNext }: { step: InteractiveStepData; onNext: () => void }) => {
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  return (
    <View style={s.container}>
      <Text style={s.title}>Interactive Exercise</Text>

      {step.activityType === 'flashcard' && step.cards ? (
        <ScrollView contentContainerStyle={s.pb20}>
          {step.cards.map((c, i) => {
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
                <Text style={[s.flashcardHint, isFlipped && s.flashcardHintFlipped]}>
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

const QuizStep = ({ step, onNext }: { step: QuizStepData; onNext?: () => void }) => (
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

const PracticeStep = ({ step, onNext }: { step: PracticeStepData; onNext?: () => void }) => (
  <View style={s.container}>
    <Text style={s.title}>Practice</Text>
    <View style={s.card}>
      <Text style={s.cardTitle}>Task</Text>
      <Text style={s.text}>{step.task}</Text>
    </View>
    <View style={[s.card, s.mt10]}>
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

// Each step component takes its own narrow, schema-derived prop type (SummaryStepData,
// VideoStepData, ...), so this lookup map can't carry a single precise value type — TS has
// no sound way to express "a function whose param type depends on the record key" here.
// The cast lives at this one boundary only; every component body above is fully typed.
export const stepRenderers: Record<LearningStep['type'], React.FC<any>> = {
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

  feedbackBanner: { padding: 16, borderRadius: 12, borderWidth: 1.5, marginBottom: 20 },
  feedbackTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  feedbackDesc: { fontSize: 14, color: Colors.dark, lineHeight: 20 },

  actionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 'auto', paddingTop: 20, gap: 12 },
  continueBtn: { backgroundColor: Colors.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
  flexBtn: { flex: 1 },
  disabledBtn: { backgroundColor: Colors.grayLight },
  continueBtnText: { color: Colors.white, fontSize: 17, fontWeight: '800' },

  skipBtn: { padding: 18, borderRadius: 16, alignItems: 'center', backgroundColor: Colors.primaryBg, borderWidth: 1, borderColor: Colors.primary + '30' },
  skipBtnText: { color: Colors.primary, fontSize: 16, fontWeight: '700' },

  flashcard: { backgroundColor: Colors.white, minHeight: 180, borderRadius: 16, padding: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.primaryLight, marginBottom: 16, shadowColor: Colors.primary, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  flashcardFlipped: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary, borderWidth: 2 },
  flashcardText: { fontSize: 20, fontWeight: '700', color: Colors.dark, textAlign: 'center' },
  flashcardTextFlipped: { color: Colors.primary },
  flashcardHint: { fontSize: 12, color: Colors.gray, marginTop: 20, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
  flashcardHintFlipped: { color: Colors.primaryMid },

  mt20: { marginTop: 20 },
  mt10: { marginTop: 10 },
  my20: { marginTop: 20, marginBottom: 20 },
  bold: { fontWeight: '700' },
  semiBold: { fontWeight: '600', color: Colors.dark },
  pb20: { paddingBottom: 20 },
});
