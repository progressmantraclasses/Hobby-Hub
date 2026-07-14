import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../theme/colors';
import LevelUpCelebration from '../components/LevelUpCelebration';
import { XP_PER_CHAPTER } from '../utils/xp';
import { RootStackParamList } from '../navigation/types';

export default function ChapterCompleteScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ChapterComplete'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'ChapterComplete'>>();
  const { chapter, levelUp, newLevel } = route.params;
  const [showCelebration, setShowCelebration] = useState(!!levelUp);

  return (
    <SafeAreaView style={styles.safe}>
      {showCelebration && <LevelUpCelebration level={newLevel ?? 1} onDone={() => setShowCelebration(false)} />}
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Chapter Complete!</Text>
        <Text style={styles.subtitle}>You've successfully finished "{chapter.title}".</Text>
        <View style={styles.xpCard}>
          <Text style={styles.xpLabel}>REWARD</Text>
          <Text style={styles.xpValue}>+{XP_PER_CHAPTER} XP</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('CourseDetail')}>
          <Text style={styles.btnText}>Back to Course</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emoji: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '900', color: Colors.white, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: Colors.primaryLight, textAlign: 'center', marginBottom: 40, lineHeight: 24 },
  xpCard: { backgroundColor: Colors.white, padding: 24, borderRadius: 20, alignItems: 'center', width: '100%' },
  xpLabel: { fontSize: 12, fontWeight: '800', color: Colors.gray, letterSpacing: 2, marginBottom: 8 },
  xpValue: { fontSize: 36, fontWeight: '900', color: Colors.primary },
  footer: { padding: 24 },
  btn: { backgroundColor: Colors.white, padding: 18, borderRadius: 16, alignItems: 'center' },
  btnText: { color: Colors.primary, fontSize: 17, fontWeight: '800' },
});

