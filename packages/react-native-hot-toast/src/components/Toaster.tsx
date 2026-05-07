import * as React from 'react';
import {
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  resolveValue,
  type Toast,
  type ToasterProps,
  type ToastPosition,
} from '../core/types';
import { useToaster } from '../core/use-toaster';
import { ToastBar } from './ToastBar';
import { ENTER_EASE, STACK_DURATION, positionFactor } from './animations';

const DEFAULT_OFFSET = 16;

interface PositionStyles {
  alignItems: ViewStyle['alignItems'];
  vertical: ViewStyle;
}

const getAlignItems = (position: ToastPosition): ViewStyle['alignItems'] => {
  if (position.includes('center')) return 'center';
  if (position.includes('right')) return 'flex-end';
  return 'flex-start';
};

interface ToastWrapperProps {
  toast: Toast;
  position: ToastPosition;
  offset: number;
  insets: { top: number; bottom: number; left: number; right: number };
  useSafeArea: boolean;
  onHeightUpdate: (id: string, height: number) => void;
  onStartPause?: () => void;
  onEndPause?: () => void;
  pauseOnPressIn: boolean;
  swipeToDismiss: boolean;
  children: React.ReactNode;
}

const ToastWrapper: React.FC<ToastWrapperProps> = ({
  toast,
  position,
  offset,
  insets,
  useSafeArea,
  onHeightUpdate,
  children,
}) => {
  const factor = positionFactor(position);
  const target = offset * factor;
  const translateY = useSharedValue(target);

  React.useEffect(() => {
    translateY.value = withTiming(target, {
      duration: STACK_DURATION,
      easing: ENTER_EASE,
    });
  }, [target, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const onLayout = React.useCallback(
    (e: LayoutChangeEvent) => {
      onHeightUpdate(toast.id, e.nativeEvent.layout.height);
    },
    [onHeightUpdate, toast.id]
  );

  const top = position.includes('top');
  const verticalStyle: ViewStyle = top
    ? { top: useSafeArea ? insets.top + DEFAULT_OFFSET : DEFAULT_OFFSET }
    : {
        bottom: useSafeArea
          ? insets.bottom + DEFAULT_OFFSET
          : DEFAULT_OFFSET,
      };

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.wrapper,
        verticalStyle,
        { alignItems: getAlignItems(position) },
        animatedStyle,
      ]}
      pointerEvents="box-none"
    >
      {children}
    </Animated.View>
  );
};

export const Toaster: React.FC<ToasterProps> = ({
  reverseOrder,
  position = 'top-center',
  toastOptions,
  gutter,
  children,
  toasterId,
  containerStyle,
  useSafeArea = true,
  pauseOnPressIn = true,
  swipeToDismiss = false,
}) => {
  const { toasts, handlers } = useToaster(toastOptions, toasterId);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, containerStyle as StyleProp<ViewStyle>]}
      pointerEvents="box-none"
    >
      {toasts.map((t) => {
        const toastPosition = t.position || position;
        const offset = handlers.calculateOffset(t, {
          reverseOrder,
          gutter,
          defaultPosition: position,
        });

        const effectivePauseOnPressIn = t.pauseOnPressIn ?? pauseOnPressIn;
        const effectiveSwipeToDismiss = t.swipeToDismiss ?? swipeToDismiss;

        return (
          <ToastWrapper
            key={t.id}
            toast={t}
            position={toastPosition}
            offset={offset}
            insets={insets}
            useSafeArea={useSafeArea}
            onHeightUpdate={handlers.updateHeight}
            pauseOnPressIn={effectivePauseOnPressIn}
            swipeToDismiss={effectiveSwipeToDismiss}
          >
            {t.type === 'custom' ? (
              resolveValue(t.message, t)
            ) : children ? (
              children(t)
            ) : (
              <ToastBar
                toast={t}
                position={toastPosition}
                swipeToDismiss={effectiveSwipeToDismiss}
                onStartPause={
                  effectivePauseOnPressIn ? handlers.startPause : undefined
                }
                onEndPause={
                  effectivePauseOnPressIn ? handlers.endPause : undefined
                }
              />
            )}
          </ToastWrapper>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
