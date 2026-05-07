# react-native-hot-toast

[Korean README](./README.ko.md)

A React Native toast library inspired by [`react-hot-toast`](https://react-hot-toast.com). It keeps the familiar `toast.success`, `toast.error`, `toast.loading`, and `toast.promise` API while adapting the experience for native iOS and Android apps with Reanimated animations, safe-area handling, press-to-pause behavior, swipe dismissal, and optional haptic feedback.

## Package

The published package is:

```bash
npm install @kimtj12/react-native-hot-toast
```

You can also install it with pnpm or yarn:

```bash
pnpm add @kimtj12/react-native-hot-toast
yarn add @kimtj12/react-native-hot-toast
```

## Peer dependencies

Install these in your app if they are not already present:

| Package | Minimum version |
| --- | --- |
| `react` | `>=18` |
| `react-native` | `>=0.76` |
| `react-native-reanimated` | `>=3.16` |
| `react-native-safe-area-context` | `>=4.10` |
| `react-native-gesture-handler` | `>=2.20` |

For Expo apps, use Expo's installer so the native dependencies match your SDK:

```bash
npx expo install react-native-reanimated react-native-safe-area-context react-native-gesture-handler
```

## Quick start

Mount one `<Toaster />` near the root of your app. `GestureHandlerRootView` is required for gesture support, and `SafeAreaProvider` lets the toaster avoid notches and home indicators.

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

Trigger toasts from anywhere after the toaster is mounted:

```tsx
toast('Event created');
toast.success('Saved!');
toast.error('Something broke');

const loadingId = toast.loading('Uploading...');
toast.dismiss(loadingId);

toast.promise(api.save(), {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed',
});
```

## Common options

Options can be passed to a single toast or through `toastOptions` on `<Toaster />`.

```tsx
toast.success('Synced', {
  duration: 5000,
  position: 'bottom-center',
  iconTheme: {
    primary: '#111827',
    secondary: '#ffffff',
  },
  hapticFeedback: true,
  swipeToDismiss: true,
});

<Toaster
  position="top-center"
  gutter={10}
  swipeToDismiss
  toastOptions={{
    style: { backgroundColor: '#111827' },
    textStyle: { color: '#ffffff' },
    success: {
      iconTheme: { primary: '#16a34a', secondary: '#ffffff' },
    },
  }}
/>;
```

Supported positions are `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, and `bottom-right`.

## Custom rendering

Use `toast.custom` for a completely custom toast node:

```tsx
toast.custom((t) => (
  <Pressable onPress={() => toast.dismiss(t.id)}>
    <Text>Custom toast</Text>
  </Pressable>
));
```

Or pass a render function to `<Toaster />` if you want to keep the store and stacking behavior but replace the default bar UI:

```tsx
<Toaster>
  {(t) => (
    <ToastBar toast={t}>
      {({ icon, message }) => (
        <>
          {icon}
          <View style={{ marginLeft: 8 }}>{message}</View>
        </>
      )}
    </ToastBar>
  )}
</Toaster>
```

For fully headless integrations, import from the headless entrypoint:

```tsx
import {
  toast,
  useToaster,
  useToasterStore,
} from '@kimtj12/react-native-hot-toast/headless';
```

## Differences from react-hot-toast

This library follows the original API where it makes sense for React Native, but a few details are intentionally different:

- `className` is not supported because there is no DOM.
- `style` uses React Native's `StyleProp<ViewStyle>`.
- `textStyle` and `iconStyle` are available for native styling.
- Hover-based pause is replaced by `pauseOnPressIn`, which is enabled by default.
- `swipeToDismiss` is available for mobile gestures and is opt-in by default.
- `useSafeArea` is enabled by default on `<Toaster />`.
- `hapticFeedback` can be enabled per toast.

## Monorepo development

This repository contains the library package and an Expo example app:

```text
react-native-hot-toast/
|-- packages/react-native-hot-toast/   Library package
|-- apps/example/                      Expo demo app
`-- react-hot-toast/                   Upstream reference copy
```

Install dependencies:

```bash
pnpm install
```

Run the example app:

```bash
pnpm example
```

Build the library:

```bash
pnpm build
```

Run type checks:

```bash
pnpm typecheck
```

Build output is written to `packages/react-native-hot-toast/lib/`.

## License

MIT. See [packages/react-native-hot-toast/LICENSE](./packages/react-native-hot-toast/LICENSE).

## Acknowledgements

This project is a respectful React Native port of [`react-hot-toast`](https://github.com/timolins/react-hot-toast) by Timo Lins and its contributors. The API design, animation feel, and developer experience are based on the original web library.
