import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { usePlanStore } from '../store/planStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ProgressRing } from '../components/ProgressRing';
import { TechniqueCard } from '../components/TechniqueCard';

export default function DashboardScreen() {
  const { plan, techniqueStatus } = usePlanStore();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  if (!plan) return <Text style={styles.center}>No plan found.</Text>;

  const total = plan.techniques.length;
  const mastered = plan.techniques.filter((t) => techniqueStatus[t.title] === 'mastered').length;
  const progress = total === 0 ? 0 : mastered / total;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Your Plan</Text>
          <Text style={styles.subtitle}>{mastered} / {total} Mastered</Text>
        </View>
        <ProgressRing progress={progress} size={60} strokeWidth={6} />
      </View>
      <FlatList
        data={plan.techniques.slice().sort((a, b) => a.order - b.order)}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <TechniqueCard
            technique={item}
            status={techniqueStatus[item.title] || 'pending'}
            onPress={() => navigation.navigate('TechniqueDetail', { technique: item })}
          />
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9FAFB' },
  center: { flex: 1, textAlign: 'center', marginTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 4 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
});
