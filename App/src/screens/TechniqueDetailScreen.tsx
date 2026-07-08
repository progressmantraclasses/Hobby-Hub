import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { usePlanStore } from '../store/planStore';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';

export default function TechniqueDetailScreen() {
  const route = useRoute<RouteProp<any, 'TechniqueDetail'>>();
  const navigation = useNavigation();
  const { technique } = route.params as any;
  const { updateTechniqueStatus, techniqueStatus } = usePlanStore();

  const isCompleted = techniqueStatus[technique.title] === 'completed';

  const toggleStatus = () => {
    updateTechniqueStatus(technique.title, isCompleted ? 'pending' : 'completed');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{technique.title}</Text>
      <Text style={styles.why}>{technique.why}</Text>
      <Text style={styles.type}>Resource Type: {technique.resourceType}</Text>
      <TouchableOpacity style={[styles.button, isCompleted && styles.completed]} onPress={toggleStatus}>
        <Text style={styles.buttonText}>{isCompleted ? 'Mark as Pending' : 'Mark as Completed'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  why: { fontSize: 16, marginBottom: 20 },
  type: { fontSize: 14, color: '#666', marginBottom: 30 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  completed: { backgroundColor: '#34C759' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
