import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

const LOADING_TEXTS = ['Thinking...', 'Preparing...', 'Customizing...', 'Generating...'];

interface Options {
  pulseScale?: number;
  pulseDuration?: number;
  textIntervalMs?: number;
}

export function useThinkingAnimation(loading: boolean, options: Options = {}) {
  const { pulseScale = 1.1, pulseDuration = 600, textIntervalMs = 1500 } = options;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [loadingText, setLoadingText] = useState(LOADING_TEXTS[0]);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: pulseScale, duration: pulseDuration, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: pulseDuration, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [loading, pulseAnim, pulseScale, pulseDuration]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      let i = 0;
      setLoadingText(LOADING_TEXTS[i]);
      interval = setInterval(() => {
        i = (i + 1) % LOADING_TEXTS.length;
        setLoadingText(LOADING_TEXTS[i]);
      }, textIntervalMs);
    }
    return () => clearInterval(interval);
  }, [loading, textIntervalMs]);

  return { pulseAnim, loadingText };
}
