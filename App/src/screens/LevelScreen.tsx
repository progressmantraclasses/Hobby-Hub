import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePlanStore } from '../store/planStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { PlanRequest } from '../schemas/plan.schema';

const LEVELS: PlanRequest['level'][] = ['beginner', 'intermediate', 'advanced'];

export default function LevelScreen() {
  const { setLevel } = usePlanStore();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleSelect = (level: PlanRequest['level']) => {
    setLevel(level);
    navigation.navigate('TimeCommitment');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your current level?</Text>
      {LEVELS.map((lvl) => (
        <TouchableOpacity key={lvl} style={styles.button} onPress={() => handleSelect(lvl)}>
          <Text style={styles.buttonText}>{lvl.charAt(0).toUpperCase() + lvl.slice(1)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#ffffff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#111827' },
  button: { backgroundColor: '#f0f0f0', padding: 20, borderRadius: 8, marginBottom: 15, alignItems: 'center' },
  buttonText: { fontSize: 18, fontWeight: '500', color: '#111827' },
});
