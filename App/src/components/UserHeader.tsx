import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface UserHeaderProps {
  userName: string;
  streak: number;
  greetingText: string;
}

export default function UserHeader({ userName, streak, greetingText }: UserHeaderProps) {
  return (
    <View style={s.topRow}>
      <View>
        <Text style={s.greet}>{greetingText}</Text>
        <Text style={s.username}>{userName}</Text>
      </View>
      <View style={s.streakBadge}>
        <Text style={s.streakFire}>🔥</Text>
        <Text style={s.streakNum}>{streak}d</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greet: { fontSize: 22, fontWeight: '800', color: Colors.dark },
  username: { fontSize: 16, fontWeight: '700', color: Colors.primary, marginTop: 2 },
  streakBadge: { backgroundColor: Colors.secondaryBg, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.secondaryLight },
  streakFire: { fontSize: 18 },
  streakNum: { fontSize: 16, fontWeight: '900', color: Colors.secondary },
});
