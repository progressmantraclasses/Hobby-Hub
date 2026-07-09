import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { usePlanStore } from '../store/planStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../theme/colors';

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
      setError(result.error.errors[0].message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>What do you want{'\n'}to learn?</Text>
      <Text style={styles.sub}>Enter any hobby or skill</Text>
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="e.g. Guitar, Cooking, Chess"
        placeholderTextColor={Colors.gray}
        autoFocus
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.85}>
        <Text style={styles.buttonText}>Continue →</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface, padding: 28, justifyContent: 'center' },
  heading: { fontSize: 34, fontWeight: '800', color: Colors.dark, lineHeight: 42, marginBottom: 8 },
  sub: { fontSize: 15, color: Colors.gray, marginBottom: 32 },
  input: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.grayLight,
    borderRadius: 14, padding: 16, fontSize: 17, color: Colors.dark, marginBottom: 10,
    shadowColor: Colors.primary, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  error: { color: Colors.danger, fontSize: 13, marginBottom: 10, fontWeight: '600' },
  button: {
    backgroundColor: Colors.primary, borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 8,
    shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  buttonText: { color: Colors.white, fontSize: 17, fontWeight: '800' },
});
