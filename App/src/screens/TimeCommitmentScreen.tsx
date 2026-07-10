import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlanStore } from '../store/planStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { generatePlan } from '../services/api';
import { Colors } from '../theme/colors';

export default function TimeCommitmentScreen() {
  const { hobby, level, addHobby } = usePlanStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hours, setHours] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [loading]);

  const handleSelect = async () => {
    const time = parseInt(hours, 10);
    if (isNaN(time) || time < 2 || time > 168) {
      setError('Please enter a valid number between 2 and 168');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (!hobby || !level) throw new Error('Missing data');
      const plan = await generatePlan({ hobby, level, weeklyTime: time });
      addHobby(plan);
      navigation.navigate('CourseDetail');
    } catch (err: any) {
      setError(err.message || 'Failed to generate plan');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <Animated.View style={[styles.loadingCircle, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.loadingIcon}>✨</Text>
          </Animated.View>
          <Text style={styles.loadingTitle}>Crafting Your Journey...</Text>
          <Text style={styles.loadingSub}>Analyzing optimal learning paths for {hobby}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'center' }}>
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
              setError('');
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface, padding: 28 },
  heading: { fontSize: 34, fontWeight: '800', color: Colors.dark, lineHeight: 42, marginBottom: 8 },
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
});
