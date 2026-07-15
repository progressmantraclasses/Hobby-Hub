import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Animated, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlanStore } from '../store/planStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { generatePlan } from '../services/api';
import { Colors } from '../theme/colors';
import { useAsyncTask } from '../hooks/useAsyncTask';
import { useThinkingAnimation } from '../hooks/useThinkingAnimation';
import { LearnScreenNavigationProp, MainTabParamList, RootStackParamList } from '../navigation/types';

export default function TimeCommitmentScreen() {
  const { hobby, level, addHobby } = usePlanStore();
  const { status, error: fetchError, run } = useAsyncTask(generatePlan);
  const [navigating, setNavigating] = useState(false);
  const loading = status === 'loading' || navigating;
  const [validationError, setValidationError] = useState('');
  const [hours, setHours] = useState('');
  const navigation = useNavigation<LearnScreenNavigationProp<'TimeCommitment'>>();
  const error = validationError || fetchError || '';

  const { pulseAnim, loadingText } = useThinkingAnimation(loading, { pulseScale: 1.15, pulseDuration: 800 });

  const handleSelect = async () => {
    const time = parseInt(hours, 10);
    if (isNaN(time) || time < 2 || time > 168) {
      setValidationError('Please enter a valid number between 2 and 168');
      return;
    }
    setValidationError('');

    if (!hobby || !level) return;
    try {
      const plan = await run({ hobby, level, weeklyTime: time });
      setNavigating(true);
      addHobby(plan);
      const rootNavigation = navigation
        .getParent<NativeStackNavigationProp<MainTabParamList>>()
        ?.getParent<NativeStackNavigationProp<RootStackParamList>>();
      rootNavigation?.reset({
        index: 1,
        routes: [
          { name: 'MainTabs', params: { screen: 'Course' } },
          { name: 'CourseDetail' },
        ],
      });
    } catch {
      // error is surfaced via the hook's `error` state
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <Animated.View style={[styles.loadingCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.loadingIcon}>✨</Text>
          </Animated.View>
          <Text style={styles.loadingTitle}>{loadingText}</Text>
          <Text style={styles.loadingSub}>Analyzing optimal learning paths for {hobby}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Onboarding Step Tracker */}
      <View style={styles.stepContainer}>
        <View style={styles.stepInfo}>
          <Text style={styles.stepLabel}>STEP 3 OF 3</Text>
          <Text style={styles.stepName}>Time Commitment</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, styles.progressFillWidth]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} bounces={false}>
        <Text style={styles.heading}>How much time{'\n'}can you commit?</Text>
        <Text style={styles.sub}>Enter hours per week (min 2, max 168)</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            placeholder="e.g. 5"
            placeholderTextColor={Colors.grayLight}
            value={hours}
            onChangeText={(text) => {
              setHours(text);
              setValidationError('');
            }}
            maxLength={3}
            autoFocus
          />
          <Text style={styles.inputSuffix}>hrs / week</Text>
        </View>

        <TouchableOpacity
          style={[styles.btn, !hours && styles.btnDisabled]}
          onPress={handleSelect}
          disabled={!hours}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>Generate My Plan ✨</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },

  stepContainer: { paddingHorizontal: 28, paddingTop: 12, marginBottom: 24 },
  stepInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  stepLabel: { fontSize: 10, fontWeight: '900', color: Colors.primary, letterSpacing: 1.5 },
  stepName: { fontSize: 12, fontWeight: '700', color: Colors.gray },
  progressBar: { height: 6, backgroundColor: Colors.grayLight, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },

  content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: '15%', paddingBottom: 60 },
  heading: { fontSize: 32, fontWeight: '900', color: Colors.dark, lineHeight: 40, marginBottom: 8, letterSpacing: -0.5 },
  sub: { fontSize: 15, color: Colors.gray, marginBottom: 32 },
  error: { color: Colors.danger, fontSize: 14, fontWeight: '600', marginBottom: 14 },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    marginBottom: 24
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    color: Colors.dark,
    paddingVertical: 18,
  },
  inputSuffix: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.gray,
    marginLeft: 12,
  },

  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  btnDisabled: {
    backgroundColor: Colors.grayLight,
    shadowOpacity: 0,
    elevation: 0
  },
  btnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800'
  },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 2, borderColor: Colors.primaryLight },
  loadingIcon: { fontSize: 40 },
  loadingTitle: { fontSize: 24, fontWeight: '800', color: Colors.dark, marginBottom: 8, textAlign: 'center' },
  loadingSub: { fontSize: 15, color: Colors.gray, textAlign: 'center', paddingHorizontal: 20, lineHeight: 22 },
  progressFillWidth: { width: '100%' },
});