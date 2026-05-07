import * as React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import type { IconTheme } from '../../core/types';
import {
  CIRCLE_DELAY,
  CIRCLE_DURATION,
  EASE_OUT,
  ERROR_LINE1_DELAY,
  ERROR_LINE2_DELAY,
  ERROR_LINE_DURATION,
  OVERSHOOT,
} from '../animations';

interface ErrorIconProps {
  iconTheme?: IconTheme;
}

export const ErrorIcon: React.FC<ErrorIconProps> = ({ iconTheme }) => {
  const primary = iconTheme?.primary ?? '#ff4b4b';
  const secondary = iconTheme?.secondary ?? '#fff';

  const circleScale = useSharedValue(0);
  const circleOpacity = useSharedValue(0);
  const line1 = useSharedValue(0);
  const line2 = useSharedValue(0);

  React.useEffect(() => {
    // Circle: scale 0→1 + rotate 45°, 0.3s @100ms, OVERSHOOT — error.tsx:47-49
    circleScale.value = withDelay(
      CIRCLE_DELAY,
      withTiming(1, { duration: CIRCLE_DURATION, easing: OVERSHOOT })
    );
    circleOpacity.value = withDelay(
      CIRCLE_DELAY,
      withTiming(1, { duration: CIRCLE_DURATION, easing: OVERSHOOT })
    );

    // First line: scale 0→1, 0.15s @150ms ease-out — error.tsx:54-55
    line1.value = withDelay(
      ERROR_LINE1_DELAY,
      withTiming(1, { duration: ERROR_LINE_DURATION, easing: EASE_OUT })
    );
    // Second line: scale 0→1, rotate 90°, 0.15s @180ms ease-out — error.tsx:67-69
    line2.value = withDelay(
      ERROR_LINE2_DELAY,
      withTiming(1, { duration: ERROR_LINE_DURATION, easing: EASE_OUT })
    );
  }, [circleOpacity, circleScale, line1, line2]);

  const circleStyle = useAnimatedStyle(() => ({
    opacity: circleOpacity.value,
    transform: [{ scale: circleScale.value }, { rotate: '45deg' }],
  }));

  const line1Style = useAnimatedStyle(() => ({
    opacity: line1.value,
    transform: [{ scale: line1.value }],
  }));

  const line2Style = useAnimatedStyle(() => ({
    opacity: line2.value,
    transform: [{ scale: line2.value }, { rotate: '90deg' }],
  }));

  return (
    <Animated.View
      style={[styles.circle, { backgroundColor: primary }, circleStyle]}
    >
      <Animated.View
        style={[styles.line, { backgroundColor: secondary }, line1Style]}
      />
      <Animated.View
        style={[styles.line, { backgroundColor: secondary }, line2Style]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'relative',
  },
  line: {
    position: 'absolute',
    bottom: 9,
    left: 4,
    height: 2,
    width: 12,
    borderRadius: 3,
  },
});
