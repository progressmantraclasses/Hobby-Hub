import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlanStore } from '../store/planStore';
import { useNavigation } from '@react-navigation/native';
import { PlanRequest } from '../schemas/plan.schema';
import { Colors } from '../theme/colors';
import { LEVELS } from '../constants/levels';
import { LearnScreenNavigationProp } from '../navigation/types';

export default function LevelScreen() {
  const { setLevel } = usePlanStore();
  const navigation = useNavigation<LearnScreenNavigationProp<'Level'>>();

  const handleSelect = (level: PlanRequest['level']) => {
    setLevel(level);
    navigation.navigate('TimeCommitment');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Onboarding Step Tracker */}
      <View style={styles.stepContainer}>
        <View style={styles.stepInfo}>
          <Text style={styles.stepLabel}>STEP 2 OF 3</Text>
          <Text style={styles.stepName}>Current Level</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, styles.progressFillWidth]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        <Text style={styles.heading}>What's your{'\n'}current level?</Text>
        <Text style={styles.sub}>Pick the option that fits best</Text>
        {LEVELS.map((lvl) => (
          <TouchableOpacity key={lvl.value} style={styles.card} onPress={() => handleSelect(lvl.value)} activeOpacity={0.75}>
            <View style={styles.dot} />
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitle}>{lvl.label}</Text>
              <Text style={styles.cardDesc}>{lvl.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  
  stepContainer: { paddingHorizontal: 28, paddingTop: 12, marginBottom: 24 },
  stepInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  stepLabel: { fontSize: 10, fontWeight: '900', color: Colors.primary, letterSpacing: 1.5 },
  stepName: { fontSize: 12, fontWeight: '700', color: Colors.gray },
  progressBar: { height: 6, backgroundColor: Colors.grayLight, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },

  content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: '10%', paddingBottom: 60 },
  heading: { fontSize: 32, fontWeight: '900', color: Colors.dark, lineHeight: 40, marginBottom: 8, letterSpacing: -0.5 },
  sub: { fontSize: 15, color: Colors.gray, marginBottom: 32 },
  card: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 18, marginBottom: 14,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: Colors.primary, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    borderWidth: 1.5, borderColor: Colors.grayLight,
  },
  cardTextWrap: { flex: 1, paddingRight: 8 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.primary, marginRight: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.dark, marginBottom: 3 },
  cardDesc: { fontSize: 13, color: Colors.gray, lineHeight: 18 },
  progressFillWidth: { width: '66.6%' },
});
