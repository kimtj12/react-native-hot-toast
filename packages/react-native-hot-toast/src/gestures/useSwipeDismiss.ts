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
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const screenWidth = Dimensions.get('window').width;

  const dismiss = React.useCallback(() => {
    toast.dismiss(toastId);
  }, [toastId]);

  const gesture = React.useMemo(() => {
    if (!enabled) return undefined;

    return Gesture.Pan()
      .activeOffsetX([-10, 10])
      .failOffsetY([-12, 12])
      .onUpdate((event) => {
        translateX.value = event.translationX;
        const distance = Math.abs(event.translationX);
        opacity.value = Math.max(0.2, 1 - distance / (screenWidth * 0.6));
      })
      .onEnd((event) => {
        const distance = Math.abs(event.translationX);
        const velocity = Math.abs(event.velocityX);
        const shouldDismiss =
          distance > SWIPE_DISTANCE_THRESHOLD ||
          velocity > SWIPE_VELOCITY_THRESHOLD;

        if (shouldDismiss) {
          const direction = event.translationX > 0 ? 1 : -1;
          translateX.value = withTiming(direction * screenWidth, {
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
          translateX.value = withTiming(0, {
            duration: SPRING_BACK_DURATION,
            easing: Easing.out(Easing.cubic),
          });
          opacity.value = withTiming(1, {
            duration: SPRING_BACK_DURATION,
            easing: Easing.out(Easing.cubic),
          });
        }
      });
  }, [enabled, dismiss, screenWidth, translateX, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return { gesture, animatedStyle };
};
