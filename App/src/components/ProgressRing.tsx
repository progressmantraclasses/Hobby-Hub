import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../theme/colors';

interface Props {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

export const ProgressRing = ({ progress, size = 60, strokeWidth = 6 }: Props) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle stroke={Colors.overlayLight} fill="none" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
        <Circle
          stroke={Colors.white}
          fill="none"
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          originX={size / 2} originY={size / 2}
          rotation="-90"
        />
      </Svg>
      <Text style={styles.text}>{Math.round(progress * 100)}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  text: { fontSize: 14, fontWeight: '800', color: Colors.white },
});
