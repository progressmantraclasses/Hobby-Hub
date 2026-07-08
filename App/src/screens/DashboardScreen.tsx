import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { usePlanStore } from '../store/planStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
  const { plan, techniqueStatus } = usePlanStore();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  if (!plan) return <Text style={styles.center}>No plan found.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Learning Plan</Text>
      <FlatList
        data={plan.techniques}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TechniqueDetail', { technique: item })}
          >
            <View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardType}>{item.resourceType}</Text>
            </View>
            <Text>{techniqueStatus[item.title] === 'completed' ? '✅' : '⭕'}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, textAlign: 'center', marginTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 15, backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardType: { color: '#666', marginTop: 5 },
});
