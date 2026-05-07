import * as React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type {
  Renderable,
  Toast,
  ToastPosition,
} from '../core/types';
import { resolveValue } from '../core/types';
import { prefersReducedMotion } from '../core/utils';
import { useSwipeDismiss } from '../gestures/useSwipeDismiss';
import { ToastIcon } from './ToastIcon';
import {
  ENTER_DURATION,
  ENTER_EASE,
  EXIT_DURATION,
  EXIT_EASE,
  REDUCED_MOTION_DURATION,
  positionFactor,
} from './animations';

const UNMEASURED_TRANSLATE_Y = 1000;

interface ToastBarProps {
  toast: Toast;
  position?: ToastPosition;
  style?: StyleProp<ViewStyle>;
  onStartPause?: () => void;
  onEndPause?: () => void;
  swipeToDismiss?: boolean;
  children?: (components: {
    icon: Renderable;
    message: Renderable;
  }) => Renderable;
}

export const ToastBar: React.FC<ToastBarProps> = React.memo(
  ({
    toast,
    position,
    style,
    onStartPause,
    onEndPause,
    swipeToDismiss = true,
    children,
  }) => {
    const factor = positionFactor(toast.position || position || 'top-center');
    const height = toast.height ?? 0;
    const reduced = prefersReducedMotion();
    const swipe = useSwipeDismiss(toast.id, swipeToDismiss && toast.visible);

    const translateY = useSharedValue(
      reduced ? 0 : factor * -UNMEASURED_TRANSLATE_Y
    );
    const scale = useSharedValue(reduced ? 1 : 0.6);
    const opacity = useSharedValue(0);

    React.useEffect(() => {
      // Wait for height measurement before starting enter animation.
      // toast-bar.tsx:82 — { opacity: 0 } when height is unknown.
      if (height === 0) return;

      if (toast.visible) {
        if (reduced) {
          translateY.value = 0;
          scale.value = 1;
          opacity.value = withTiming(1, {
            duration: REDUCED_MOTION_DURATION,
            easing: Easing.linear,
          });
          return;
        }
        translateY.value = factor * -2 * height;
        scale.value = 0.6;
        opacity.value = 0.5;
        translateY.value = withTiming(0, {
          duration: ENTER_DURATION,
          easing: ENTER_EASE,
        });
        scale.value = withTiming(1, {
          duration: ENTER_DURATION,
          easing: ENTER_EASE,
        });
        opacity.value = withTiming(1, {
          duration: ENTER_DURATION,
          easing: ENTER_EASE,
        });
      } else {
        if (reduced) {
          opacity.value = withTiming(0, {
            duration: REDUCED_MOTION_DURATION,
            easing: Easing.linear,
          });
          return;
        }
        translateY.value = withTiming(factor * -1.5 * height, {
          duration: EXIT_DURATION,
          easing: EXIT_EASE,
        });
        scale.value = withTiming(0.6, {
          duration: EXIT_DURATION,
          easing: EXIT_EASE,
        });
        opacity.value = withTiming(0, {
          duration: EXIT_DURATION,
          easing: EXIT_EASE,
        });
      }
      return () => {
        cancelAnimation(translateY);
        cancelAnimation(scale);
        cancelAnimation(opacity);
      };
    }, [factor, height, toast.visible, reduced, translateY, scale, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: (height === 0 ? 0 : opacity.value) * swipe.opacity.value,
      transform: [
        { translateY: translateY.value + swipe.translateY.value },
        { scale: scale.value },
      ],
    }));

    const icon = <ToastIcon toast={toast} style={toast.iconStyle} />;
    const messageText = resolveValue(toast.message, toast);
    const message =
      typeof messageText === 'string' ? (
        <Text
          style={[styles.message, toast.textStyle]}
          accessibilityLiveRegion={toast.accessibilityLiveRegion}
          accessibilityRole={toast.accessibilityRole ?? 'text'}
        >
          {messageText}
        </Text>
      ) : (
        messageText
      );

    const renderedChildren =
      typeof children === 'function'
        ? children({ icon, message })
        : (
            <>
              {icon}
              {message}
            </>
          );

    const inner = (
      <Pressable
        onPressIn={onStartPause}
        onPressOut={onEndPause}
        style={styles.pressable}
      >
        <Animated.View
          style={[
            styles.bar,
            style,
            toast.style,
            animatedStyle,
            height === 0 && styles.measuring,
          ]}
        >
          {renderedChildren}
        </Animated.View>
      </Pressable>
    );

    if (swipe.gesture) {
      return <GestureDetector gesture={swipe.gesture}>{inner}</GestureDetector>;
    }
    return inner;
  }
);
ToastBar.displayName = 'ToastBar';

const styles = StyleSheet.create({
  pressable: {
    pointerEvents: 'auto',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    maxWidth: 350,
    // toast-bar.tsx:30 — single-shadow approximation of the stacked CSS shadow.
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  measuring: {
    opacity: 0,
  },
  message: {
    flexShrink: 1,
    marginHorizontal: 10,
    marginVertical: 4,
    color: '#363636',
    fontSize: 15,
    lineHeight: 20,
  },
});
