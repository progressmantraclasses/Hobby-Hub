import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Technique } from '../../schemas/plan.schema';

interface BlockProps {
  technique: Technique;
}

const VideoBlock = ({ technique }: BlockProps) => (
  <View style={styles.block}>
    <Text style={styles.text}>🎥 Video content for: {technique.searchQuery}</Text>
  </View>
);

const ReadingBlock = ({ technique }: BlockProps) => (
  <View style={styles.block}>
    <Text style={styles.text}>📖 Reading material for: {technique.searchQuery}</Text>
  </View>
);

const InteractiveDrillBlock = ({ technique }: BlockProps) => (
  <View style={styles.block}>
    <Text style={styles.text}>⚡ Interactive Drill (Stub)</Text>
  </View>
);

const ChecklistBlock = ({ technique }: BlockProps) => (
  <View style={styles.block}>
    <Text style={styles.text}>✅ Practice Checklist</Text>
  </View>
);

export const resourceRenderers: Record<string, React.FC<BlockProps>> = {
  'watch': VideoBlock,
  'read': ReadingBlock,
  'interactive-drill': InteractiveDrillBlock,
  'practice-checklist': ChecklistBlock,
};

const styles = StyleSheet.create({
  block: { padding: 16, backgroundColor: '#F3F4F6', borderRadius: 8, marginVertical: 10 },
  text: { fontSize: 14, color: '#374151' },
});
