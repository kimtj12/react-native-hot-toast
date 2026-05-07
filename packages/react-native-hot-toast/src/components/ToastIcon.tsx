import * as React from 'react';
import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import type { Toast } from '../core/types';
import { CheckmarkIcon } from './icons/CheckmarkIcon';
import { ErrorIcon } from './icons/ErrorIcon';
import { LoaderIcon } from './icons/LoaderIcon';
import { ICON_WRAP_DELAY, ICON_WRAP_DURATION, OVERSHOOT } from './animations';

interface ToastIconProps {
  toast: Toast;
  style?: StyleProp<ViewStyle>;
}

const AnimatedIconWrapper: React.FC<{
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({ children, style }) => {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0.4);

  React.useEffect(() => {
    // toast-icon.tsx:32-39 — scale 0.6→1, opacity 0.4→1, 0.3s @120ms OVERSHOOT
    scale.value = withDelay(
      ICON_WRAP_DELAY,
      withTiming(1, { duration: ICON_WRAP_DURATION, easing: OVERSHOOT })
    );
    opacity.value = withDelay(
      ICON_WRAP_DELAY,
      withTiming(1, { duration: ICON_WRAP_DURATION, easing: OVERSHOOT })
    );
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.animatedWrapper, animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

export const ToastIcon: React.FC<ToastIconProps> = ({ toast, style }) => {
  const { icon, type, iconTheme } = toast;

  if (icon !== undefined && icon !== null) {
    if (typeof icon === 'string') {
      return (
        <AnimatedIconWrapper style={style}>
          <Text style={styles.emoji}>{icon}</Text>
        </AnimatedIconWrapper>
      );
    }
    return <AnimatedIconWrapper style={style}>{icon}</AnimatedIconWrapper>;
  }

  if (type === 'blank' || type === 'custom') {
    return null;
  }

  return (
    <Animated.View style={[styles.indicator, style]}>
      <LoaderIcon iconTheme={iconTheme} />
      {type !== 'loading' && (
        <Animated.View style={styles.statusOverlay}>
          {type === 'error' ? (
            <ErrorIcon iconTheme={iconTheme} />
          ) : (
            <CheckmarkIcon iconTheme={iconTheme} />
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  indicator: {
    position: 'relative',
    minWidth: 20,
    minHeight: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOverlay: {
    position: 'absolute',
  },
  animatedWrapper: {
    minWidth: 20,
    minHeight: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 18,
    lineHeight: 20,
    textAlign: 'center',
  },
});
