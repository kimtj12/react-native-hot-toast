# react-native-hot-toast

[English README](./README.md)

[`react-hot-toast`](https://react-hot-toast.com)에서 영감을 받은 React Native 토스트 라이브러리입니다. 익숙한 `toast.success`, `toast.error`, `toast.loading`, `toast.promise` API를 유지하면서, 네이티브 iOS 및 Android 앱에 맞게 Reanimated 애니메이션, safe area 처리, 누르는 동안 일시정지, 스와이프 dismiss, 선택적 햅틱 피드백을 제공합니다.

## 패키지

배포 패키지는 다음과 같습니다.

```bash
npm install @kimtj12/react-native-hot-toast
```

pnpm 또는 yarn으로도 설치할 수 있습니다.

```bash
pnpm add @kimtj12/react-native-hot-toast
yarn add @kimtj12/react-native-hot-toast
```

## Peer dependencies

앱에 아래 패키지가 없다면 함께 설치하세요.

| 패키지 | 최소 버전 |
| --- | --- |
| `react` | `>=18` |
| `react-native` | `>=0.76` |
| `react-native-reanimated` | `>=3.16` |
| `react-native-safe-area-context` | `>=4.10` |
| `react-native-gesture-handler` | `>=2.20` |

Expo 앱에서는 SDK에 맞는 네이티브 의존성이 설치되도록 Expo 설치 명령을 사용하세요.

```bash
npx expo install react-native-reanimated react-native-safe-area-context react-native-gesture-handler
```

## 빠른 시작

앱 루트 근처에 `<Toaster />`를 한 번만 마운트하세요. 제스처 지원을 위해 `GestureHandlerRootView`가 필요하고, `SafeAreaProvider`는 토스트가 노치와 홈 인디케이터를 피하도록 해줍니다.

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

토스터가 마운트된 뒤에는 앱 어디서든 토스트를 호출할 수 있습니다.

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

## 주요 옵션

옵션은 개별 토스트에 전달하거나 `<Toaster />`의 `toastOptions`로 기본값을 지정할 수 있습니다.

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

지원하는 위치는 `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`입니다.

## 커스텀 렌더링

완전히 직접 만든 토스트 노드가 필요하면 `toast.custom`을 사용하세요.

```tsx
toast.custom((t) => (
  <Pressable onPress={() => toast.dismiss(t.id)}>
    <Text>Custom toast</Text>
  </Pressable>
));
```

기본 store와 스택 동작은 유지하면서 바 UI만 교체하려면 `<Toaster />`에 render 함수를 전달할 수 있습니다.

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

완전한 headless 통합이 필요하면 headless entrypoint에서 가져오세요.

```tsx
import {
  toast,
  useToaster,
  useToasterStore,
} from '@kimtj12/react-native-hot-toast/headless';
```

## react-hot-toast와 다른 점

이 라이브러리는 React Native에 맞는 범위에서 원본 API를 따르지만, 몇 가지 차이는 의도된 것입니다.

- DOM이 없기 때문에 `className`은 지원하지 않습니다.
- `style`은 React Native의 `StyleProp<ViewStyle>`을 사용합니다.
- 네이티브 스타일링을 위해 `textStyle`과 `iconStyle`을 제공합니다.
- hover 기반 pause 대신 `pauseOnPressIn`을 사용하며 기본값은 켜짐입니다.
- 모바일 제스처용 `swipeToDismiss`를 제공하며 기본값은 꺼짐입니다.
- `<Toaster />`의 `useSafeArea`는 기본값이 켜짐입니다.
- 개별 토스트에서 `hapticFeedback`을 켤 수 있습니다.

## 모노레포 개발

이 저장소는 라이브러리 패키지와 Expo 예제 앱을 함께 포함합니다.

```text
react-native-hot-toast/
|-- packages/react-native-hot-toast/   라이브러리 패키지
|-- apps/example/                      Expo 데모 앱
`-- react-hot-toast/                   원본 참조 복사본
```

의존성 설치:

```bash
pnpm install
```

예제 앱 실행:

```bash
pnpm example
```

라이브러리 빌드:

```bash
pnpm build
```

타입 체크:

```bash
pnpm typecheck
```

빌드 결과물은 `packages/react-native-hot-toast/lib/`에 생성됩니다.

## 라이선스

MIT. [packages/react-native-hot-toast/LICENSE](./packages/react-native-hot-toast/LICENSE)를 참고하세요.

## 감사의 말

이 프로젝트는 Timo Lins와 기여자들이 만든 [`react-hot-toast`](https://github.com/timolins/react-hot-toast)를 React Native용으로 정중하게 포팅한 라이브러리입니다. API 설계, 애니메이션 감각, 개발자 경험은 원본 웹 라이브러리를 기반으로 합니다.
