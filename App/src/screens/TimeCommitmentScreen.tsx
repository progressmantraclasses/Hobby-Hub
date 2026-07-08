import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { usePlanStore } from '../store/planStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { generatePlan } from '../services/api';

const TIMES = [
  { label: '2 hours/week', value: 2 },
  { label: '5 hours/week', value: 5 },
  { label: '10 hours/week', value: 10 },
];

export default function TimeCommitmentScreen() {
  const { hobby, level, setWeeklyTime, setPlan } = usePlanStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleSelect = async (time: number) => {
    setWeeklyTime(time);
    setLoading(true);
    setError('');

    try {
      if (!hobby || !level) throw new Error('Missing data');
      const plan = await generatePlan({ hobby, level, weeklyTime: time });
      setPlan(plan);
      navigation.navigate('Dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How much time can you commit?</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        TIMES.map((t) => (
          <TouchableOpacity key={t.value} style={styles.button} onPress={() => handleSelect(t.value)}>
            <Text style={styles.buttonText}>{t.label}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#ffffff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#111827' },
  button: { backgroundColor: '#f0f0f0', padding: 20, borderRadius: 8, marginBottom: 15, alignItems: 'center' },
  buttonText: { fontSize: 18, fontWeight: '500', color: '#111827' },
  error: { color: 'red', marginBottom: 20, textAlign: 'center' },
});
