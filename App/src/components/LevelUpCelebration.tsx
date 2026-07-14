import React, { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';

interface Props { level: number; onDone: () => void; }

export default function LevelUpCelebration({ level, onDone }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-140)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 7 }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]),
      Animated.delay(1800),
      Animated.parallel([
        Animated.timing(translateY, { toValue: -140, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]).start(onDone);
  }, [onDone, opacity, translateY]);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[s.overlay, { top: insets.top + 12 }]}
    >
      <Animated.View style={[s.card, { opacity, transform: [{ translateY }] }]}>
        <Text style={s.emoji}>🎉</Text>
        <View style={s.textWrap}>
          <Text style={s.title}>Level Up!</Text>
          <Text style={s.sub}>You reached Level {level}</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  overlay: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 999 },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    maxWidth: '90%',
    shadowColor: Colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  textWrap: { marginLeft: 12 },
  emoji: { fontSize: 34 },
  title: { fontSize: 20, fontWeight: '900', color: Colors.dark },
  sub: { fontSize: 14, color: Colors.gray, fontWeight: '600' },
});
