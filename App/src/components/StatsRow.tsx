import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export interface StatItem {
  icon: string;
  val: string;
  lbl: string;
}

interface StatsRowProps {
  stats: StatItem[];
}

export default function StatsRow({ stats }: StatsRowProps) {
  return (
    <View style={s.statsRow}>
      {stats.map((st, i, arr) => (
        <React.Fragment key={st.lbl}>
          <View style={s.stat}>
            <Text style={s.statIcon}>{st.icon}</Text>
            <Text style={s.statVal}>{st.val}</Text>
            <Text style={s.statLbl}>{st.lbl}</Text>
          </View>
          {i < arr.length - 1 && <View style={s.statDiv} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  statsRow: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 18, paddingVertical: 16, marginBottom: 14, borderWidth: 1, borderColor: Colors.grayLight },
  stat: { flex: 1, alignItems: 'center' },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statVal: { fontSize: 14, fontWeight: '800', color: Colors.dark },
  statLbl: { fontSize: 10, color: Colors.gray, fontWeight: '600', marginTop: 2 },
  statDiv: { width: 1, backgroundColor: Colors.grayLight },
});
