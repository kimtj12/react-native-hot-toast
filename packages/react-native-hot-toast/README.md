# @kimtj12/react-native-hot-toast

> Smoking hot toasts for React Native. A faithful port of [`react-hot-toast`](https://react-hot-toast.com) with polished animations powered by Reanimated v4 and mobile-native gestures.

[![npm version](https://img.shields.io/npm/v/@kimtj12/react-native-hot-toast.svg)](https://www.npmjs.com/package/@kimtj12/react-native-hot-toast)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

## Features

- 🎨 Same lovable API as `react-hot-toast` (`toast.success`, `toast.error`, `toast.promise`, ...)
- ⚡ Buttery-smooth animations on Reanimated v4 worklets
- 👆 Mobile-native UX: tap to pause, swipe to dismiss
- 🦺 Safe-area aware out of the box
- 🧩 Headless API for fully custom UIs

## Installation

```bash
npm install @kimtj12/react-native-hot-toast
# or
pnpm add @kimtj12/react-native-hot-toast
# or
yarn add @kimtj12/react-native-hot-toast
```

### Peer dependencies

Make sure your app already has these installed:

| Package | Minimum version |
|---|---|
| `react` | ≥ 18 |
| `react-native` | ≥ 0.76 |
| `react-native-reanimated` | ≥ 3.16 (v4 compatible) |
| `react-native-safe-area-context` | ≥ 4.10 |
| `react-native-gesture-handler` | ≥ 2.20 |

> Expo users: `npx expo install react-native-reanimated react-native-safe-area-context react-native-gesture-handler` will pick versions that match your SDK.

## Quick start

Wrap your app with `GestureHandlerRootView` and `SafeAreaProvider`, then mount a single `<Toaster />` near the root:

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { toast, Toaster } from '@kimtj12/react-native-hot-toast';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <YourScreens />
        <Toaster />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

Then trigger toasts from anywhere in your app:

```tsx
toast('Hello world');
toast.success('Saved!');
toast.error('Something broke');
toast.loading('Uploading...');

toast.promise(api.save(), {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed',
});
```

## API highlights

```tsx
import {
  toast,
  Toaster,
  ToastBar,
  ToastIcon,
  CheckmarkIcon,
  ErrorIcon,
  LoaderIcon,
} from '@kimtj12/react-native-hot-toast';
```

A headless entrypoint is also exposed for fully custom UIs:

```tsx
import { useToaster, useToasterStore } from '@kimtj12/react-native-hot-toast/headless';
```

## Differences from `react-hot-toast`

This is a port aimed at native mobile, so a few things differ:

- `style` is `StyleProp<ViewStyle>`; new `textStyle` and `iconStyle` props for fine control
- `className` is removed (no DOM)
- Desktop hover-based pause is replaced with `pauseOnPressIn` (on by default)
- New `swipeToDismiss` prop (on by default, can be disabled)
- New `useSafeArea` prop (on by default)

## License

MIT © [kimskulltj](https://github.com/kimtj12)

## Acknowledgements

Huge thanks to [**Timo Lins**](https://github.com/timolins) and the contributors of [`react-hot-toast`](https://github.com/timolins/react-hot-toast). This library is a respectful port that owes everything to the original — the API design, the animation choices, and the lovely DX. If you build for the web, please use the original. ❤️
