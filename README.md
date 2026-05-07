# react-native-hot-toast

React Native 포트 of [`react-hot-toast`](https://react-hot-toast.com). 원본의 폴리시드한
진입/퇴장 애니메이션, 체크마크/에러 아이콘 그리기, 스택 오프셋 트랜지션을 그대로
복제했고 모바일 네이티브 UX(누르면 일시정지, 스와이프 dismiss)을 추가했습니다.

## 모노레포 구조

```
react-native-hot-toast/
├── packages/react-native-hot-toast/   라이브러리
├── apps/example/                      Expo 데모 앱
└── react-hot-toast/                   원본 참조 (수정 안 함)
```

## 시작하기

```bash
pnpm install
pnpm --filter example start
```

iOS 시뮬레이터/실기기에서 데모 화면이 뜨고, 각 버튼으로 토스트 동작을 확인할 수 있습니다.

## 라이브러리 빌드

```bash
pnpm --filter react-native-hot-toast build
```

산출물은 `packages/react-native-hot-toast/lib/`에 CJS, ESM, `.d.ts`로 출력됩니다.

## 사용법

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { toast, Toaster } from 'react-native-hot-toast';

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

// Anywhere in your app
toast.success('Saved!');
toast.error('Something broke');
toast.loading('Uploading...');
toast.promise(api.save(), {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed',
});
```

## Peer dependencies

| 패키지 | 버전 |
|---|---|
| react | ≥18 |
| react-native | ≥0.76 |
| react-native-reanimated | ≥3.16 (v4 호환) |
| react-native-safe-area-context | ≥4.10 |
| react-native-gesture-handler | ≥2.20 |

## 원본과의 차이

- `style` 은 `StyleProp<ViewStyle>`, 새 prop으로 `textStyle`, `iconStyle` 추가
- `className` 은 삭제
- 데스크톱 hover 기반 pause 대신 `pauseOnPressIn` (기본 켜짐)
- `swipeToDismiss` 신규 (opt-in)
- `useSafeArea` 신규 (기본 켜짐)

## 라이선스

MIT
