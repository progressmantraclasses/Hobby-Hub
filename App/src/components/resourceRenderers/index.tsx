import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Technique } from '../../schemas/plan.schema';
import { ConceptCard } from '../ConceptCard';

interface BlockProps {
  technique: Technique;
}

const VideoBlock = ({ technique }: BlockProps) => (
  <View style={styles.block}>
    <Text style={styles.text}>🎥 Video content for: {technique.searchQuery}</Text>
  </View>
);

const ReadingBlock = ({ technique }: BlockProps) => {
  if (technique.conceptMap) {
    return <ConceptCard data={technique.conceptMap} />;
  }
  return (
    <View style={styles.block}>
      <Text style={styles.text}>📖 Reading material for: {technique.searchQuery}</Text>
    </View>
  );
};

const InteractiveDrillBlock = ({ technique }: BlockProps) => {
  // Simple 8x8 hardcoded chess puzzle: White Rook to move from A1 to A8 for mate.
  const [selected, setSelected] = useState<{r: number, c: number} | null>(null);
  
  const handleTap = (r: number, c: number) => {
    if (!selected) {
      if (r === 7 && c === 0) setSelected({ r, c }); // select white rook at bottom left
    } else {
      if (r === 0 && c === 0) Alert.alert('Correct!', 'Checkmate!');
      else Alert.alert('Incorrect', 'Try again.');
      setSelected(null);
    }
  };

  return (
    <View style={styles.drillContainer}>
      <Text style={styles.drillTitle}>Find the Mate in 1</Text>
      <View style={styles.board}>
        {Array.from({ length: 8 }).map((_, r) => (
          <View key={r} style={styles.row}>
            {Array.from({ length: 8 }).map((_, c) => {
              const isDark = (r + c) % 2 !== 0;
              const isSelected = selected?.r === r && selected?.c === c;
              let piece = '';
              if (r === 7 && c === 0) piece = '♖'; // White Rook A1
              if (r === 0 && c === 6) piece = '♚'; // Black King G8
              if (r === 2 && c === 6) piece = '♔'; // White King G6
              
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.square, { backgroundColor: isDark ? '#769656' : '#eeeed2', borderWidth: isSelected ? 2 : 0, borderColor: 'yellow' }]}
                  onPress={() => handleTap(r, c)}
                >
                  <Text style={styles.piece}>{piece}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

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
  drillContainer: { alignItems: 'center', marginVertical: 16 },
  drillTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  board: { borderWidth: 2, borderColor: '#333' },
  row: { flexDirection: 'row' },
  square: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  piece: { fontSize: 24 }
});
