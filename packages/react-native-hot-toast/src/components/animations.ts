import { Easing } from 'react-native-reanimated';

// react-hot-toast/src/components/toast-bar.tsx:70 — cubic-bezier(.21,1.02,.73,1)
export const ENTER_EASE = Easing.bezier(0.21, 1.02, 0.73, 1);
// toast-bar.tsx:71 — cubic-bezier(.06,.71,.55,1)
export const EXIT_EASE = Easing.bezier(0.06, 0.71, 0.55, 1);
// toast-icon.tsx:38, checkmark.tsx:43, error.tsx:47 — cubic-bezier(0.175, 0.885, 0.32, 1.275) overshoot
export const OVERSHOOT = Easing.bezier(0.175, 0.885, 0.32, 1.275);
export const EASE_OUT = Easing.out(Easing.ease);

export const ENTER_DURATION = 350; // toast-bar.tsx:70 0.35s
export const EXIT_DURATION = 400; // toast-bar.tsx:71 0.4s
export const STACK_DURATION = 230; // toaster.tsx:69 230ms
export const REDUCED_MOTION_DURATION = 200;

export const ICON_WRAP_DURATION = 300; // toast-icon.tsx:38 0.3s
export const ICON_WRAP_DELAY = 120; // toast-icon.tsx:38 0.12s

export const CIRCLE_DURATION = 300; // checkmark.tsx:43, error.tsx:47 0.3s
export const CIRCLE_DELAY = 100;

export const CHECK_DELAY = 200; // checkmark.tsx:49
export const CHECK_DURATION = 200; // 0.2s — split into 40% width, 60% height
export const CHECK_WIDTH_PORTION = 0.4;
export const CHECK_HEIGHT_PORTION = 0.6;

export const ERROR_LINE_DURATION = 150; // error.tsx 0.15s
export const ERROR_LINE1_DELAY = 150;
export const ERROR_LINE2_DELAY = 180;

export const LOADER_DURATION = 1000;

export const positionFactor = (pos: string): 1 | -1 =>
  pos.includes('top') ? 1 : -1;
