import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Technique } from '../schemas/plan.schema';
import { TechniqueStatus } from '../store/planStore';
import { StatusChip } from './StatusChip';

interface Props {
  technique: Technique;
  status: TechniqueStatus;
  onPress: () => void;
}

export const TechniqueCard = ({ technique, status, onPress }: Props) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title}>{technique.title}</Text>
        <StatusChip status={status} />
      </View>
      <Text style={styles.type}>{technique.resourceType}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', flex: 1, marginRight: 8 },
  type: { fontSize: 12, color: '#6B7280', textTransform: 'capitalize' },
});
