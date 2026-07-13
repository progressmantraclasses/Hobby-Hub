import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { usePlanStore } from '../store/planStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';
import { HOBBY_SUGGESTIONS } from '../constants/hobbies';

const HobbySchema = z.string().min(2, 'Hobby must be at least 2 characters');

export default function HobbyScreen() {
  const { hobby, setHobby } = usePlanStore();
  const [input, setInput] = useState(hobby || '');
  const [error, setError] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleNext = () => {
    const result = HobbySchema.safeParse(input.trim());
    if (result.success) {
      setError('');
      setHobby(result.data);
      navigation.navigate('Level');
    } else {
      setError(result.error.issues[0].message);
    }
  };

  const selectSuggestion = (name: string) => {
    setInput(name);
    setError('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior="padding"
      >
        {/* Onboarding Step Tracker */}
        <View style={styles.stepContainer}>
          <View style={styles.stepInfo}>
            <Text style={styles.stepLabel}>STEP 1 OF 3</Text>
            <Text style={styles.stepName}>Choose Hobby</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '33.3%' }]} />
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>What do you want{'\n'}to learn?</Text>
          <Text style={styles.sub}>Enter any skill or select one of the popular choices below</Text>

          <TextInput
            style={[styles.input, input ? styles.inputActive : null]}
            value={input}
            onChangeText={(text) => {
              setInput(text);
              setError('');
            }}
            placeholder="e.g. Guitar, Cooking, Chess..."
            placeholderTextColor={Colors.gray}
            maxLength={30}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.sectionTitle}>Popular Hobbies</Text>
          <View style={styles.suggestionGrid}>
            {HOBBY_SUGGESTIONS.map((item) => {
              const isSelected = input.trim().toLowerCase() === item.name.toLowerCase();
              return (
                <TouchableOpacity
                  key={item.name}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => selectSuggestion(item.name)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.chipEmoji}>{item.emoji}</Text>
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]} numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, !input.trim() && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!input.trim()}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  stepContainer: { paddingHorizontal: 28, paddingTop: 12, marginBottom: 20 },
  stepInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  stepLabel: { fontSize: 10, fontWeight: '900', color: Colors.primary, letterSpacing: 1.5 },
  stepName: { fontSize: 12, fontWeight: '700', color: Colors.gray },
  progressBar: { height: 6, backgroundColor: Colors.grayLight, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },

  scroll: { paddingHorizontal: 28, paddingBottom: 60 },
  heading: { fontSize: 32, fontWeight: '900', color: Colors.dark, lineHeight: 40, marginBottom: 8, letterSpacing: -0.5 },
  sub: { fontSize: 15, color: Colors.gray, lineHeight: 22, marginBottom: 28 },

  input: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.grayLight,
    borderRadius: 16, padding: 18, fontSize: 17, color: Colors.dark, marginBottom: 8,
    shadowColor: Colors.primary, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
  },
  inputActive: { borderColor: Colors.primaryLight },
  error: { color: Colors.danger, fontSize: 13, marginBottom: 12, fontWeight: '600', paddingLeft: 4 },

  sectionTitle: { fontSize: 14, fontWeight: '800', color: Colors.dark, marginTop: 20, marginBottom: 16, letterSpacing: 0.5, textTransform: 'uppercase' },
  suggestionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  chip: {
    width: '31%', // Ensures exactly 3 items per row with space-between
    flexDirection: 'column', alignItems: 'center', backgroundColor: Colors.white,
    paddingVertical: 14, paddingHorizontal: 4, borderRadius: 16, marginBottom: 12,
    borderWidth: 1.5, borderColor: Colors.grayLight,
    shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 6, elevation: 1,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  chipEmoji: { fontSize: 26, marginBottom: 6 },
  chipText: { fontSize: 13, fontWeight: '700', color: Colors.dark, textAlign: 'center' },
  chipTextActive: { color: Colors.primary },

  footer: { paddingHorizontal: 28, paddingBottom: 8, paddingTop: 12, backgroundColor: Colors.surface },
  button: {
    backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 12, width: '100%', alignItems: 'center', alignSelf: 'center',
    shadowColor: Colors.primary, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5,
  },
  buttonDisabled: { backgroundColor: Colors.grayLight, shadowOpacity: 0, elevation: 0 },
  buttonText: { color: Colors.white, fontSize: 18, fontWeight: '800' },
});
