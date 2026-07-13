import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';

interface QuestCardProps { badgeText: string; title: string; subtitle: string; icon: string; onPress: () => void; }

export default function QuestCard({ badgeText, title, subtitle, icon, onPress }: QuestCardProps) {
  return (
    <TouchableOpacity style={s.startCard} onPress={onPress} activeOpacity={0.85}>
      <View style={s.questBadge}>
        <Text style={s.questBadgeText}>{badgeText}</Text>
      </View>
      <View style={s.startContent}>
        <View style={s.startLeft}>
          <Text style={s.startTitle}>{title}</Text>
          <Text style={s.startSub}>{subtitle}</Text>
        </View>
        <View style={s.questIconContainer}>
          <Text style={s.questIcon}>{icon}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  startCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, marginTop: 20, marginBottom: 8, borderWidth: 1.5, borderColor: Colors.primaryLight, shadowColor: Colors.primary, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3, position: 'relative', overflow: 'hidden' },
  questBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 5, borderBottomLeftRadius: 12 },
  questBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  startContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  startLeft: { flex: 1, paddingRight: 16 },
  startTitle: { fontSize: 17, fontWeight: '900', color: Colors.dark, marginBottom: 5 },
  startSub: { fontSize: 13, color: Colors.gray, lineHeight: 18 },
  questIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.primaryLight },
  questIcon: { fontSize: 24 },
});
