import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlanStore } from '../store/planStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { generatePlan } from '../services/api';
import { Colors } from '../theme/colors';

const TIMES = [
  { label: '2 hours / week', sub: 'Light commitment',  value: 2 },
  { label: '5 hours / week', sub: 'Steady progress',   value: 5 },
  { label: '10 hours / week', sub: 'Fast track',       value: 10 },
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>How much time{'\n'}can you commit?</Text>
      <Text style={styles.sub}>We'll build your plan around this</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Generating your plan…</Text>
        </View>
      ) : (
        TIMES.map((t) => (
          <TouchableOpacity key={t.value} style={styles.card} onPress={() => handleSelect(t.value)} activeOpacity={0.75}>
            <View style={styles.dot} />
            <View>
              <Text style={styles.cardTitle}>{t.label}</Text>
              <Text style={styles.cardSub}>{t.sub}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface, padding: 28, justifyContent: 'center' },
  heading: { fontSize: 34, fontWeight: '800', color: Colors.dark, lineHeight: 42, marginBottom: 8 },
  sub: { fontSize: 15, color: Colors.gray, marginBottom: 32 },
  error: { color: Colors.danger, fontSize: 13, fontWeight: '600', marginBottom: 14, textAlign: 'center' },
  card: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 18, marginBottom: 14,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: Colors.primary, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    borderWidth: 1.5, borderColor: Colors.grayLight,
  },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.primary, marginRight: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.dark, marginBottom: 3 },
  cardSub: { fontSize: 13, color: Colors.gray },
  loadingWrap: { alignItems: 'center', marginTop: 20 },
  loadingText: { marginTop: 14, fontSize: 15, color: Colors.gray, fontWeight: '600' },
});
