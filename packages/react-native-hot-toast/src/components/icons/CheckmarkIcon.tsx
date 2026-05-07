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
  CHECK_DELAY,
  CHECK_DURATION,
  CHECK_HEIGHT_PORTION,
  CHECK_WIDTH_PORTION,
  EASE_OUT,
  OVERSHOOT,
} from '../animations';

interface CheckmarkIconProps {
  iconTheme?: IconTheme;
}

const CHECKMARK_WIDTH = 6;
const CHECKMARK_HEIGHT = 10;

export const CheckmarkIcon: React.FC<CheckmarkIconProps> = ({ iconTheme }) => {
  const primary = iconTheme?.primary ?? '#61d345';
  const secondary = iconTheme?.secondary ?? '#fff';

  const circleScale = useSharedValue(0);
  const circleOpacity = useSharedValue(0);
  const barWidth = useSharedValue(0);
  const barHeight = useSharedValue(0);
  const barOpacity = useSharedValue(0);

  React.useEffect(() => {
    // Circle: scale 0 → 1, opacity 0 → 1, 0.3s @100ms, OVERSHOOT
    // checkmark.tsx:43-45
    circleScale.value = withDelay(
      CIRCLE_DELAY,
      withTiming(1, { duration: CIRCLE_DURATION, easing: OVERSHOOT })
    );
    circleOpacity.value = withDelay(
      CIRCLE_DELAY,
      withTiming(1, { duration: CIRCLE_DURATION, easing: OVERSHOOT })
    );

    // Bar: width 0→6 (0-40%), height 0→10 (40-100%) over 200ms @200ms delay
    // checkmark.tsx:13-27
    const widthMs = CHECK_DURATION * CHECK_WIDTH_PORTION; // 80ms
    const heightMs = CHECK_DURATION * CHECK_HEIGHT_PORTION; // 120ms
    barOpacity.value = withDelay(
      CHECK_DELAY,
      withTiming(1, { duration: 1, easing: EASE_OUT })
    );
    barWidth.value = withDelay(
      CHECK_DELAY,
      withTiming(CHECKMARK_WIDTH, { duration: widthMs, easing: EASE_OUT })
    );
    barHeight.value = withDelay(
      CHECK_DELAY + widthMs,
      withTiming(CHECKMARK_HEIGHT, { duration: heightMs, easing: EASE_OUT })
    );
  }, [barHeight, barOpacity, barWidth, circleOpacity, circleScale]);

  const circleStyle = useAnimatedStyle(() => ({
    opacity: circleOpacity.value,
    transform: [{ scale: circleScale.value }, { rotate: '45deg' }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: barWidth.value,
    height: barHeight.value,
    opacity: barOpacity.value,
  }));

  return (
    <Animated.View
      style={[styles.circle, { backgroundColor: primary }, circleStyle]}
    >
      <Animated.View
        style={[styles.bar, { borderColor: secondary }, barStyle]}
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
  bar: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    borderRightWidth: 2,
    borderBottomWidth: 2,
  },
});
