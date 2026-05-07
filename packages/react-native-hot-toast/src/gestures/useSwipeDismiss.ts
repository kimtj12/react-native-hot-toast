import * as React from 'react';
import { Dimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { toast } from '../core/toast';

const SWIPE_DISTANCE_THRESHOLD = 80;
const SWIPE_VELOCITY_THRESHOLD = 800;
const SPRING_BACK_DURATION = 200;
const FLY_OUT_DURATION = 220;

export const useSwipeDismiss = (toastId: string, enabled: boolean) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const screenHeight = Dimensions.get('window').height;

  const dismiss = React.useCallback(() => {
    toast.dismiss(toastId);
  }, [toastId]);

  const gesture = React.useMemo(() => {
    if (!enabled) return undefined;

    return Gesture.Pan()
      .activeOffsetY(-10)
      .failOffsetX([-12, 12])
      .onUpdate((event) => {
        translateY.value = Math.min(event.translationY, 0);
        const distance = Math.max(-event.translationY, 0);
        opacity.value = Math.max(0.2, 1 - distance / (screenHeight * 0.35));
      })
      .onEnd((event) => {
        const distance = Math.max(-event.translationY, 0);
        const velocity = Math.max(-event.velocityY, 0);
        const shouldDismiss =
          distance > SWIPE_DISTANCE_THRESHOLD ||
          velocity > SWIPE_VELOCITY_THRESHOLD;

        if (shouldDismiss) {
          translateY.value = withTiming(-screenHeight, {
            duration: FLY_OUT_DURATION,
            easing: Easing.out(Easing.cubic),
          });
          opacity.value = withTiming(
            0,
            { duration: FLY_OUT_DURATION, easing: Easing.out(Easing.cubic) },
            (finished) => {
              if (finished) runOnJS(dismiss)();
            }
          );
        } else {
          translateY.value = withTiming(0, {
            duration: SPRING_BACK_DURATION,
            easing: Easing.out(Easing.cubic),
          });
          opacity.value = withTiming(1, {
            duration: SPRING_BACK_DURATION,
            easing: Easing.out(Easing.cubic),
          });
        }
      });
  }, [enabled, dismiss, screenHeight, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return { gesture, animatedStyle };
};
