import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlanStore } from '../store/planStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { PlanRequest } from '../schemas/plan.schema';
import { Colors } from '../theme/colors';

const LEVELS: { value: PlanRequest['level']; label: string; desc: string }[] = [
  { value: 'beginner',     label: 'Beginner',     desc: 'Just starting out, no prior experience' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Some experience, ready to level up'  },
  { value: 'advanced',     label: 'Advanced',     desc: 'Solid base, pushing toward mastery'   },
];

export default function LevelScreen() {
  const { setLevel } = usePlanStore();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleSelect = (level: PlanRequest['level']) => {
    setLevel(level);
    navigation.navigate('TimeCommitment');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>What's your{'\n'}current level?</Text>
      <Text style={styles.sub}>Pick the option that fits best</Text>
      {LEVELS.map((lvl) => (
        <TouchableOpacity key={lvl.value} style={styles.card} onPress={() => handleSelect(lvl.value)} activeOpacity={0.75}>
          <View style={styles.dot} />
          <View>
            <Text style={styles.cardTitle}>{lvl.label}</Text>
            <Text style={styles.cardDesc}>{lvl.desc}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface, padding: 28, justifyContent: 'center' },
  heading: { fontSize: 34, fontWeight: '800', color: Colors.dark, lineHeight: 42, marginBottom: 8 },
  sub: { fontSize: 15, color: Colors.gray, marginBottom: 32 },
  card: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 18, marginBottom: 14,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: Colors.primary, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    borderWidth: 1.5, borderColor: Colors.grayLight,
  },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.primary, marginRight: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: Colors.dark, marginBottom: 3 },
  cardDesc: { fontSize: 13, color: Colors.gray },
});
