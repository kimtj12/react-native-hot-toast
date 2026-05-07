import { AccessibilityInfo } from 'react-native';

export const genId = (() => {
  let count = 0;
  return () => {
    return (++count).toString();
  };
})();

export const prefersReducedMotion = (() => {
  let shouldReduceMotion: boolean | undefined = undefined;

  AccessibilityInfo.isReduceMotionEnabled().then((value) => {
    shouldReduceMotion = value;
  });

  AccessibilityInfo.addEventListener('reduceMotionChanged', (value) => {
    shouldReduceMotion = value;
  });

  return () => shouldReduceMotion ?? false;
})();
