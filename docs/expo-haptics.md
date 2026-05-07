# Expo Haptics 사용 가이드

이 문서는 Expo 앱에서 `expo-haptics`를 설치하고 `react-native-hot-toast`의 `hapticFeedback` 옵션과 함께 사용하는 방법을 정리합니다. 이 저장소의 Expo 예제는 iOS와 Android 네이티브 앱을 기준으로 합니다.

공식 문서: [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)

## 설치

Expo 앱에서는 SDK와 맞는 네이티브 패키지 버전이 설치되도록 `expo install`을 사용하세요.

```bash
npx expo install expo-haptics
```

기존 bare React Native 앱에서 Expo 모듈을 쓰려면 먼저 Expo 모듈 설정이 필요합니다. 일반 Expo 앱이나 이 저장소의 `apps/example`에서는 위 명령만 사용하면 됩니다.

## 기본 API

```tsx
import * as Haptics from 'expo-haptics';
```

자주 쓰는 API는 세 가지입니다.

- `Haptics.selectionAsync()`: 선택 변경, 탭 전환, 가벼운 UI 선택에 사용합니다.
- `Haptics.notificationAsync(type)`: 성공, 경고, 실패 같은 결과 피드백에 사용합니다.
- `Haptics.impactAsync(style)`: 버튼 누름, 드래그 시작, 충돌감 같은 물리적 피드백에 사용합니다.

예시:

```tsx
await Haptics.selectionAsync();

await Haptics.notificationAsync(
  Haptics.NotificationFeedbackType.Success
);

await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
```

## 토스트에서 사용하기

`react-native-hot-toast`의 `hapticFeedback` 옵션은 `boolean` 또는 콜백을 받을 수 있습니다.

`true`를 전달하면 라이브러리의 기본 햅틱 피드백이 실행됩니다.

```tsx
import { toast } from '@kimtj12/react-native-hot-toast';

toast.success('Saved', {
  hapticFeedback: true,
});
```

`expo-haptics`를 직접 쓰고 싶다면 콜백을 전달하세요. 콜백은 토스트가 표시될 때 한 번 실행됩니다.

```tsx
import * as Haptics from 'expo-haptics';
import { toast } from '@kimtj12/react-native-hot-toast';

toast.success('Saved', {
  hapticFeedback: () => {
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    );
  },
});
```

토스트 타입에 따라 다른 피드백을 줄 수도 있습니다.

```tsx
import * as Haptics from 'expo-haptics';
import { toast, type Toast } from '@kimtj12/react-native-hot-toast';

const toastHaptic = (t: Toast) => {
  if (t.type === 'success') {
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    );
    return;
  }

  if (t.type === 'error') {
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Error
    );
    return;
  }

  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

toast.success('Saved', {
  hapticFeedback: toastHaptic,
});

toast.error('Failed', {
  hapticFeedback: toastHaptic,
});

toast('Changed', {
  hapticFeedback: toastHaptic,
});
```

## Toaster 기본값으로 설정하기

앱 전체에 기본 햅틱 정책을 적용하려면 `<Toaster />`의 `toastOptions`를 사용하세요.

```tsx
import * as Haptics from 'expo-haptics';
import { Toaster, type Toast } from '@kimtj12/react-native-hot-toast';

const toastHaptic = (t: Toast) => {
  if (t.type === 'success') {
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    );
    return;
  }

  if (t.type === 'error') {
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Error
    );
    return;
  }

  void Haptics.selectionAsync();
};

export function AppToaster() {
  return (
    <Toaster
      toastOptions={{
        hapticFeedback: toastHaptic,
        loading: {
          hapticFeedback: false,
        },
      }}
    />
  );
}
```

위 예시는 모든 토스트에 햅틱을 적용하되, `loading` 토스트는 제외합니다. `toast.loading()`은 오래 떠 있거나 `toast.promise()` 중간 상태로 자주 쓰이므로 보통 햅틱을 끄는 편이 덜 부담스럽습니다.

## 추천 매핑

| 토스트 타입 | 추천 API |
| --- | --- |
| `success` | `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)` |
| `error` | `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)` |
| `blank` | `Haptics.selectionAsync()` 또는 `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` |
| `custom` | UI 의미에 맞게 선택 |
| `loading` | 보통 비활성화 |

## 주의할 점

- 햅틱은 실제 기기에서 확인하세요. 시뮬레이터나 에뮬레이터에서는 동작이 제한되거나 느껴지지 않을 수 있습니다.
- iOS에서는 저전력 모드, 사용자 설정, 카메라 사용, 받아쓰기 사용 등의 조건에서 Taptic Engine이 동작하지 않을 수 있습니다.
- Android에서는 기기와 OS 버전에 따라 강도와 느낌이 다를 수 있습니다.
- 너무 많은 토스트에 강한 햅틱을 넣으면 피로감이 큽니다. 성공과 실패처럼 의미가 큰 상태 변화에 우선 적용하세요.
