import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { z } from 'zod';
import { usePlanStore } from '../store/planStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

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
    <View style={styles.container}>
      <Text style={styles.title}>What do you want to learn?</Text>
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="e.g. Guitar, Cooking, Python"
        autoFocus
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#ffffff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#111827' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 15, borderRadius: 8, fontSize: 18, marginBottom: 10, color: '#111827', backgroundColor: '#f9fafb' },
  error: { color: 'red', marginBottom: 10 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
