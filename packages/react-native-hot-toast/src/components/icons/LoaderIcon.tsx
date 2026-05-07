import * as React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import type { IconTheme } from '../../core/types';
import { LOADER_DURATION } from '../animations';

interface LoaderIconProps {
  iconTheme?: IconTheme;
}

export const LoaderIcon: React.FC<LoaderIconProps> = ({ iconTheme }) => {
  const primary = iconTheme?.primary ?? '#616161';
  const secondary = iconTheme?.secondary ?? '#e0e0e0';
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: LOADER_DURATION, easing: Easing.linear }),
      -1,
      false
    );
    return () => cancelAnimation(rotation);
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        styles.loader,
        { borderColor: secondary, borderRightColor: primary },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  loader: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
});
