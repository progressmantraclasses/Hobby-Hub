import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TechniqueStatus } from '../store/planStore';

interface Props {
  status: TechniqueStatus;
}

const statusColors: Record<TechniqueStatus, { bg: string; text: string }> = {
  pending: { bg: '#E5E7EB', text: '#374151' },
  in_progress: { bg: '#FEF3C7', text: '#D97706' },
  mastered: { bg: '#D1FAE5', text: '#059669' },
  not_for_me: { bg: '#FEE2E2', text: '#DC2626' },
};

const statusLabels: Record<TechniqueStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  mastered: 'Mastered',
  not_for_me: 'Skipped',
};

export const StatusChip = ({ status }: Props) => {
  const colors = statusColors[status] || statusColors.pending;
  const label = statusLabels[status] || 'Unknown';

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
