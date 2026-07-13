import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Colors } from '../theme/colors';

interface Props { level: number; onDone: () => void; }

export default function LevelUpCelebration({ level, onDone }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      Animated.delay(1800),
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(onDone);
  }, []);

  return (
    <Animated.View style={[s.overlay, { opacity }]}>
      <Animated.View style={[s.card, { transform: [{ scale }] }]}>
        <Text style={s.emoji}>🎉</Text>
        <Text style={s.title}>Level Up!</Text>
        <Text style={s.sub}>You reached Level {level}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.overlay, zIndex: 999 },
  card: { backgroundColor: Colors.white, borderRadius: 24, padding: 40, alignItems: 'center', shadowColor: Colors.black, shadowOpacity: 0.3, shadowRadius: 20, elevation: 20 },
  emoji: { fontSize: 52, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.dark, marginBottom: 6 },
  sub: { fontSize: 16, color: Colors.gray, fontWeight: '600' },
});
