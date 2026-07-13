import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';

interface ConceptMapData {
  root: string;
  mid: string;
  leaves: string[];
  insight: string;
  takeaway: string;
}

export const ConceptCard = ({ data }: { data: ConceptMapData }) => {
  const leavesCount = data.leaves.length || 1;
  
  return (
    <View style={styles.container}>
      {/* Root Node */}
      <View style={styles.nodePrimary}><Text style={styles.nodeTextWhite}>{data.root}</Text></View>
      
      {/* Connector */}
      <Svg height="40" width="100%">
        <Line x1="50%" y1="0" x2="50%" y2="40" stroke="#9CA3AF" strokeWidth="2" />
      </Svg>
      
      <Text style={styles.organizedText}>organized into</Text>
      
      {/* Connector */}
      <Svg height="40" width="100%">
        <Line x1="50%" y1="0" x2="50%" y2="40" stroke="#9CA3AF" strokeWidth="2" />
      </Svg>
      
      {/* Mid Node */}
      <View style={styles.nodeSecondary}><Text style={styles.nodeText}>{data.mid}</Text></View>
      
      {/* Branching SVG */}
      <Svg height="40" width="100%">
        <Line x1="50%" y1="0" x2="50%" y2="20" stroke="#9CA3AF" strokeWidth="2" />
        <Line x1="10%" y1="20" x2="90%" y2="20" stroke="#9CA3AF" strokeWidth="2" />
        {data.leaves.map((_, i) => {
          const x = 10 + (80 / (leavesCount - 1 || 1)) * i;
          return <Line key={i} x1={`${x}%`} y1="20" x2={`${x}%`} y2="40" stroke="#9CA3AF" strokeWidth="2" />;
        })}
      </Svg>

      {/* Leaves Row */}
      <View style={styles.leavesRow}>
        {data.leaves.map((leaf, i) => (
          <View key={i} style={styles.nodeLeaf}><Text style={styles.leafText}>{leaf}</Text></View>
        ))}
      </View>
      
      {/* Insight & Takeaway */}
      <View style={styles.footer}>
        <View style={styles.insightRow}>
          <Text style={styles.check}>✅</Text>
          <Text style={styles.insightText}>{data.insight}</Text>
        </View>
        <Text style={styles.takeawayText}>{data.takeaway}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, alignItems: 'center', marginVertical: 12 },
  nodePrimary: { backgroundColor: '#2563EB', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  nodeSecondary: { backgroundColor: '#DBEAFE', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: '#BFDBFE' },
  nodeLeaf: { backgroundColor: '#F1F5F9', paddingVertical: 8, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0', flex: 1, marginHorizontal: 4, alignItems: 'center' },
  nodeTextWhite: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  nodeText: { color: '#1E3A8A', fontWeight: '600', textAlign: 'center' },
  leafText: { color: '#334155', fontSize: 12, textAlign: 'center' },
  organizedText: { fontSize: 12, color: '#64748B', fontStyle: 'italic', marginVertical: -10, zIndex: 1, backgroundColor: '#F8FAFC', paddingHorizontal: 4 },
  leavesRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  footer: { marginTop: 24, width: '100%', borderTopWidth: 1, borderColor: '#E2E8F0', paddingTop: 16 },
  insightRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  check: { marginRight: 8, fontSize: 16 },
  insightText: { fontWeight: 'bold', color: '#0F172A', flex: 1 },
  takeawayText: { color: '#475569', fontSize: 14, fontStyle: 'italic' }
});
