# AI를 위한 react-native-hot-toast 사용 가이드

이 문서는 LLM 코딩 어시스턴트가 `@kimtj12/react-native-hot-toast`를 정확하게 사용하도록 돕기 위한 구조화된 레퍼런스입니다. 사람용 README는 [README.md](../README.md), 한국어 README는 [README.ko.md](../README.ko.md), 햅틱 통합은 [docs/expo-haptics.md](./expo-haptics.md)를 참고하세요.

> **요약 (TL;DR for AI)**
> 1. `npm install @kimtj12/react-native-hot-toast` 후 peer dependency 설치
> 2. 앱 루트에 `<GestureHandlerRootView>` → `<SafeAreaProvider>` → `<Toaster />`를 마운트
> 3. 어디서든 `toast(...)`, `toast.success(...)`, `toast.error(...)`, `toast.loading(...)`, `toast.promise(...)` 호출
> 4. `className` 사용 금지 (RN에는 DOM 없음). 스타일은 `style`, `textStyle`, `iconStyle` 사용
> 5. 패키지명에 scope 포함: `@kimtj12/react-native-hot-toast` (단순 `react-native-hot-toast` 아님)

---

## 1. 설치

### 1.1 패키지

```bash
npm install @kimtj12/react-native-hot-toast
# pnpm add @kimtj12/react-native-hot-toast
# yarn add @kimtj12/react-native-hot-toast
```

### 1.2 Peer dependency

| 패키지 | 최소 버전 |
| --- | --- |
| `react` | `>=18` |
| `react-native` | `>=0.76` |
| `react-native-reanimated` | `>=3.16` |
| `react-native-safe-area-context` | `>=4.10` |
| `react-native-gesture-handler` | `>=2.20` |

Expo 앱:

```bash
npx expo install react-native-reanimated react-native-safe-area-context react-native-gesture-handler
```

### 1.3 Babel/Reanimated 설정

`react-native-reanimated/plugin`이 `babel.config.js`에 추가되어 있어야 합니다. Expo SDK 50+ 의 기본 babel preset에 포함되어 있다면 추가 작업이 필요 없을 수도 있습니다.

```js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['react-native-reanimated/plugin'], // 항상 마지막에 위치
};
```

`react-native-gesture-handler`는 앱 진입 파일 최상단에서 import 해야 합니다 (네이티브 RN 한정, Expo는 자동):

```tsx
import 'react-native-gesture-handler';
```

---

## 2. 최소 셋업

`<Toaster />`는 앱 루트에 단 한 번 마운트합니다. `GestureHandlerRootView`와 `SafeAreaProvider`로 감싸야 합니다.

```tsx
import 'react-native-gesture-handler';
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

이후 어디서든 `toast(...)`를 호출할 수 있습니다 (React 컴포넌트 내부 / 외부 모두 가능, hook 아님).

---

## 3. 핵심 API

### 3.1 `toast(message, options?)`

기본 토스트 (`type: 'blank'`)를 생성합니다. 반환값은 `string` (토스트 id).

```tsx
const id = toast('Event created');
```

### 3.2 상태별 토스트

| 호출 | type | 기본 duration | 아이콘 |
| --- | --- | --- | --- |
| `toast.success(msg, opts?)` | `success` | `2000ms` | 체크 |
| `toast.error(msg, opts?)` | `error` | `4000ms` | X |
| `toast.loading(msg, opts?)` | `loading` | `Infinity` (수동 dismiss 필요) | 스피너 |
| `toast(msg, opts?)` | `blank` | `4000ms` | 없음 |
| `toast.custom(node, opts?)` | `custom` | `4000ms` | 사용자 지정 |

`loading`은 자동으로 사라지지 않습니다. `toast.dismiss(id)` 또는 `toast.promise()` 패턴으로 제거하세요.

### 3.3 `toast.promise(promise, msgs, opts?)`

비동기 작업의 라이프사이클(loading → success/error)을 자동으로 표시합니다.

```tsx
toast.promise(api.save(), {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed',
});

// 동적 메시지 (resolve 값 / error 객체 활용)
toast.promise(api.fetchUser(id), {
  loading: '불러오는 중',
  success: (user) => `${user.name} 안녕하세요`,
  error: (e) => `오류: ${e.message}`,
});

// promise 인자에 함수도 가능
toast.promise(() => api.save(), { loading: '...', success: '...', error: '...' });
```

타입별로 옵션을 다르게 적용하려면 `opts` 안에 `success`, `error`, `loading` 키를 사용합니다.

```tsx
toast.promise(api.save(), msgs, {
  style: { padding: 16 }, // 모든 단계 공통
  success: { duration: 1500 },
  error: { duration: 6000 },
});
```

### 3.4 `toast.custom(renderable, options?)`

완전히 사용자 정의된 노드를 렌더링합니다. 함수형 message로 토스트 정보를 받을 수 있습니다.

```tsx
toast.custom((t) => (
  <Pressable onPress={() => toast.dismiss(t.id)}>
    <Text>Custom toast</Text>
  </Pressable>
));
```

### 3.5 토스트 제거

```tsx
toast.dismiss(id);    // 특정 토스트의 exit 애니메이션 시작 (1초 후 제거)
toast.dismiss();      // 모든 토스트 dismiss
toast.dismissAll();   // 동일

toast.remove(id);     // 즉시 제거 (애니메이션 없음)
toast.remove();       // 모든 토스트 즉시 제거
toast.removeAll();    // 동일
```

`dismiss`는 visible=false로 만들고 1초 뒤 store에서 제거합니다. `remove`는 즉시 제거합니다. 일반적인 UX에서는 `dismiss`가 권장됩니다.

### 3.6 동일 id 재사용 (업데이트)

`opts.id`를 같게 두면 업데이트로 동작합니다. `toast.promise`도 내부적으로 이 패턴을 사용합니다.

```tsx
const id = toast.loading('업로드 중');
// ... 완료 후
toast.success('완료', { id });
```

---

## 4. `<Toaster />` 옵션

`<Toaster />`는 한 번만 마운트하며 전역 기본값을 설정합니다.

```tsx
<Toaster
  position="top-center"
  reverseOrder={false}
  gutter={8}
  containerStyle={{}}
  toasterId="default"
  useSafeArea={true}
  pauseOnPressIn={true}
  swipeToDismiss={true}
  toastOptions={{
    duration: 4000,
    style: { backgroundColor: '#111827' },
    textStyle: { color: '#fff' },
    success: { duration: 2000, iconTheme: { primary: '#16a34a', secondary: '#fff' } },
    error: { duration: 5000 },
    loading: { duration: Infinity },
  }}
/>
```

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `position` | `ToastPosition` | `'top-center'` | 기본 위치 |
| `reverseOrder` | `boolean` | `false` | 스택 순서 뒤집기 |
| `gutter` | `number` | `8` | 토스트 사이 간격 (px) |
| `containerStyle` | `StyleProp<ViewStyle>` | — | 외부 컨테이너 스타일 |
| `toasterId` | `string` | `'default'` | 다중 toaster 라우팅용 |
| `useSafeArea` | `boolean` | `true` | safe-area 인셋 적용 |
| `pauseOnPressIn` | `boolean` | `true` | 누르고 있는 동안 타이머 일시정지 |
| `swipeToDismiss` | `boolean` | `true` | 위로 스와이프해 dismiss |
| `toastOptions` | `DefaultToastOptions` | — | 모든 토스트 + 타입별 기본값 |
| `children` | `(toast: Toast) => ReactElement` | — | 커스텀 렌더 함수 |

`ToastPosition` 종류: `'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'`.

### 4.1 우선순위 (가장 강한 것이 이김)

```
toast(msg, { ... }) 의 옵션  >  toastOptions[type]  >  toastOptions  >  내장 기본값
```

`style`, `textStyle`, `iconStyle`은 배열로 합쳐집니다 (전역 → 타입별 → 개별 순서로 누적).

---

## 5. 토스트 옵션 (`ToastOptions`)

개별 호출 시 전달할 수 있는 모든 옵션입니다.

```ts
{
  id?: string;                            // 직접 지정 (업데이트 시 동일 id 재사용)
  icon?: React.ReactNode;                 // 문자열은 emoji 텍스트로 처리
  duration?: number;                      // ms. Infinity면 자동 dismiss 안 됨
  position?: ToastPosition;
  removeDelay?: number;                   // dismiss 후 store 제거까지 대기 (기본 1000ms)
  toasterId?: string;                     // 라우팅용 (다중 toaster 시)

  // 스타일
  style?: StyleProp<ViewStyle>;           // 토스트 컨테이너
  textStyle?: StyleProp<TextStyle>;       // 메시지 Text
  iconStyle?: StyleProp<ViewStyle>;       // 아이콘 래퍼
  iconTheme?: { primary: string; secondary: string }; // 내장 아이콘 색상

  // 동작
  hapticFeedback?: boolean | ((t: Toast) => void); // 햅틱
  pauseOnPressIn?: boolean;               // (toast 단위 override)
  swipeToDismiss?: boolean;               // (toast 단위 override)

  // 접근성
  ariaProps?: { role: 'status' | 'alert'; 'aria-live': 'assertive' | 'off' | 'polite' };
  accessibilityRole?: AccessibilityRole;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
}
```

`message`는 `string` 또는 `(toast: Toast) => ReactNode` 형태의 함수형도 가능합니다.

---

## 6. 자주 쓰는 패턴

### 6.1 다크 모드 토스트

```tsx
toast('Saved', {
  style: { backgroundColor: '#333', borderRadius: 30 },
  textStyle: { color: '#fff' },
});
```

### 6.2 위치 변경

```tsx
toast('Bottom message', { position: 'bottom-center' });
```

### 6.3 햅틱 (기본 진동)

```tsx
toast.success('Done', { hapticFeedback: true });
```

### 6.4 햅틱 (`expo-haptics` 콜백)

```tsx
import * as Haptics from 'expo-haptics';

toast.success('Saved', {
  hapticFeedback: () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
});
```

자세한 매핑은 [docs/expo-haptics.md](./expo-haptics.md) 참조.

### 6.5 이모지 아이콘

```tsx
toast('Hot toast', { icon: '🔥' });
```

### 6.6 로딩을 promise로 자동 처리

```tsx
const data = await toast.promise(fetchData(), {
  loading: '불러오는 중',
  success: '완료',
  error: '실패',
});
```

`toast.promise`는 promise를 그대로 반환하므로 `await` 가능.

### 6.7 직접 업데이트 (loading → success)

```tsx
const id = toast.loading('업로드 중');
try {
  await upload();
  toast.success('완료', { id });
} catch (e) {
  toast.error('실패', { id });
}
```

### 6.8 커스텀 ToastBar 렌더링

`children`에 함수를 전달하면 stacking, gesture, haptic 등의 기본 동작을 유지하면서 내부 UI만 교체할 수 있습니다.

```tsx
import { Toaster, ToastBar } from '@kimtj12/react-native-hot-toast';

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

### 6.9 다중 Toaster (영역별 알림)

화면별/영역별로 별도 토스트 큐를 만들 수 있습니다.

```tsx
<Toaster toasterId="root" />
<Toaster toasterId="modal" position="bottom-center" />

toast('hi', { toasterId: 'modal' });
toast.dismiss(undefined, 'modal'); // 'modal' 라우터의 모든 토스트만 dismiss
```

### 6.10 헤드리스 (자체 UI 구현)

토스트 store만 쓰고 렌더링은 직접 하려면 `/headless` 진입점을 사용합니다.

```tsx
import { toast, useToaster, useToasterStore } from '@kimtj12/react-native-hot-toast/headless';

function MyToaster() {
  const { toasts, handlers } = useToaster();
  // handlers: { updateHeight, startPause, endPause, calculateOffset }
  return <View>{toasts.map((t) => <MyBar key={t.id} toast={t} />)}</View>;
}
```

`useToaster`는 자동 dismiss 타이머와 햅틱 트리거까지 포함합니다. `useToasterStore`만 쓰면 store 상태만 구독합니다.

---

## 7. 타입 import

```ts
import type {
  Toast,
  ToastOptions,
  ToastPosition,
  ToastType,
  ToasterProps,
  DefaultToastOptions,
  IconTheme,
  Renderable,
  ValueOrFunction,
} from '@kimtj12/react-native-hot-toast';
```

`Toast` 객체의 주요 필드:

```ts
{
  id: string;
  type: 'success' | 'error' | 'loading' | 'blank' | 'custom';
  message: ValueOrFunction<ReactNode, Toast>;
  visible: boolean;
  dismissed: boolean;
  createdAt: number;
  pauseDuration: number;
  duration?: number;
  height?: number; // 첫 layout 후 측정됨
  // ... 사용자 지정 옵션 ...
}
```

---

## 8. AI가 자주 틀리는 함정 (꼭 피할 것)

| 잘못된 예 | 올바른 예 |
| --- | --- |
| `import { toast } from 'react-native-hot-toast'` | `import { toast } from '@kimtj12/react-native-hot-toast'` (scope 필수) |
| `toast('hi', { className: '...' })` | `toast('hi', { style: { ... } })` (RN에 className 없음) |
| `<Toaster />` 없이 `toast()` 호출 | 앱 루트에 `<Toaster />` 한 번 마운트 |
| `<Toaster />`만 마운트 | `GestureHandlerRootView` + `SafeAreaProvider`로 감싸야 함 |
| `toast.loading(...)` 후 dismiss 안 함 | `toast.dismiss(id)` 또는 `toast.success(..., { id })` |
| `useEffect` 안에서만 toast 호출 | toast는 어디서든 호출 가능. 이벤트 핸들러에서 직접 호출하면 됨 |
| `position: 'top'` | `'top-center'` 등 6가지 정확한 값만 |
| `toast.promise(fn(), ...)` 결과 무시 | promise 자체를 그대로 반환하므로 `await` 가능 |
| `style={{ color: 'red' }}` (메시지 색상) | 메시지는 `textStyle`, 컨테이너만 `style` |
| `toastOptions={{ duration: 5000 }}` 만으로 loading도 5초로 의도 | `loading.duration` 기본은 `Infinity`라 별도 지정 필요 |
| `<Toaster />`를 화면별로 여러 개 마운트 | 한 번이 원칙. 영역 분리는 `toasterId`로 |
| `swipeToDismiss`를 좌우 방향으로 가정 | 위로 스와이프 (위쪽으로 dismiss) |

---

## 9. react-hot-toast (웹) 와의 차이점

웹 버전 코드를 참고할 때 주의할 점:

- `className` 미지원 (DOM 없음)
- `style`은 RN의 `StyleProp<ViewStyle>` 사용
- `textStyle`, `iconStyle`은 RN 전용 추가 prop
- 호버 기반 pause 대신 `pauseOnPressIn` (기본 활성)
- `swipeToDismiss` 기본 활성
- `useSafeArea` 기본 활성
- `hapticFeedback` 옵션은 RN 전용
- 애니메이션은 Reanimated 기반 (CSS 애니메이션 아님)

---

## 10. 예제 모음 (한 화면에서 다 보여주기)

```tsx
import { toast } from '@kimtj12/react-native-hot-toast';

// 기본
toast('Event created');

// 상태
toast.success('Saved!');
toast.error('Something broke');
const id = toast.loading('Uploading...');
toast.dismiss(id);

// 옵션 조합
toast.success('Synced', {
  duration: 5000,
  position: 'bottom-center',
  iconTheme: { primary: '#111827', secondary: '#ffffff' },
  hapticFeedback: true,
  swipeToDismiss: false,
  style: { backgroundColor: '#111827' },
  textStyle: { color: '#fff' },
});

// 동적 메시지
toast.success((t) => `id: ${t.id}`);

// promise
await toast.promise(api.save(), {
  loading: '저장 중',
  success: (v) => `완료 (${v.id})`,
  error: (e) => `실패: ${e.message}`,
});

// 커스텀
toast.custom((t) => (
  <Pressable onPress={() => toast.dismiss(t.id)}>
    <Text>Tap to close</Text>
  </Pressable>
));

// 업데이트
const tid = toast.loading('처리 중');
setTimeout(() => toast.success('완료', { id: tid }), 1500);
```

---

## 11. 디버깅 체크리스트

토스트가 안 보일 때 차례대로 확인:

1. `<Toaster />`가 컴포넌트 트리 안에 있는가?
2. `<GestureHandlerRootView>`가 최상위에서 감싸고 있는가?
3. `<SafeAreaProvider>`가 그 안에 있는가?
4. `react-native-reanimated/plugin`이 `babel.config.js` 마지막에 추가되어 있는가? Metro 캐시 비우기 (`pnpm start --reset-cache` 또는 `npx expo start -c`)
5. peer dependency가 모두 설치되어 있는가?
6. 패키지 import가 `@kimtj12/...` scope를 포함하는가?
7. Reduced motion 환경에서는 애니메이션이 fade로 단순화됨 — 정상 동작
8. height=0 측정 중에는 opacity 0으로 보임 — 첫 frame만 그렇고 곧 표시됨

스와이프나 햅틱이 안 동작하면:

- `react-native-gesture-handler` import가 진입 파일 최상단에 있는지 (네이티브 RN)
- 시뮬레이터에서는 햅틱이 동작하지 않을 수 있음. 실기기로 확인
