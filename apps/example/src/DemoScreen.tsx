import * as React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { toast, type ToastPosition } from 'react-native-hot-toast';

const wait = (ms: number) =>
  new Promise<string>((resolve) => setTimeout(() => resolve('Done'), ms));

const failAfter = (ms: number) =>
  new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Network error')), ms)
  );

interface ButtonProps {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const Button: React.FC<ButtonProps> = ({ label, onPress, style }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.btn,
      pressed && styles.btnPressed,
      style,
    ]}
  >
    <Text style={styles.btnText}>{label}</Text>
  </Pressable>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.row}>{children}</View>
  </View>
);

const positions: ToastPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

export const DemoScreen: React.FC = () => {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>react-native-hot-toast</Text>
      <Text style={styles.subtitle}>
        Faithful port of react-hot-toast for React Native.
      </Text>

      <Section title="기본">
        <Button label="Default" onPress={() => toast('Event created')} />
        <Button
          label="Dark mode"
          onPress={() =>
            toast('Dark mode toast', {
              style: styles.darkToast,
              textStyle: styles.darkToastText,
            })
          }
        />
        <Button
          label="Long message"
          onPress={() =>
            toast(
              'This is a longer toast message.\nIt may span multiple lines.'
            )
          }
        />
        <Button
          label="5s duration"
          onPress={() => toast('5 seconds', { duration: 5000 })}
        />
      </Section>

      <Section title="상태">
        <Button label="Success" onPress={() => toast.success('Saved!')} />
        <Button label="Error" onPress={() => toast.error('Something broke')} />
        <Button
          label="Loading"
          onPress={() => toast.loading('Uploading...')}
        />
      </Section>

      <Section title="Promise">
        <Button
          label="Resolves"
          onPress={() =>
            toast.promise(wait(2000), {
              loading: 'Saving...',
              success: 'Saved!',
              error: 'Failed',
            })
          }
        />
        <Button
          label="Rejects"
          onPress={() =>
            toast.promise(failAfter(2000), {
              loading: 'Saving...',
              success: 'Saved!',
              error: 'Failed',
            })
          }
        />
      </Section>

      <Section title="Position">
        {positions.map((pos) => (
          <Button
            key={pos}
            label={pos}
            onPress={() => toast(`Hello from ${pos}`, { position: pos })}
          />
        ))}
      </Section>

      <Section title="Custom icon">
        <Button
          label="🔥 emoji"
          onPress={() => toast('Hot toast', { icon: '🔥' })}
        />
        <Button
          label="🎉 emoji"
          onPress={() => toast('Party!', { icon: '🎉' })}
        />
      </Section>

      <Section title="제어">
        <Button label="Dismiss all" onPress={() => toast.dismiss()} />
        <Button label="Remove all" onPress={() => toast.remove()} />
      </Section>

      <Section title="모바일 UX">
        <Button
          label="Haptic feedback"
          onPress={() =>
            toast.success('Haptic feedback enabled', {
              hapticFeedback: true,
            })
          }
        />
        <Button
          label="Swipe to dismiss"
          onPress={() =>
            toast('위로 스와이프하여 dismiss', {
              swipeToDismiss: true,
              duration: 8000,
            })
          }
        />
        <Button
          label="Long-press pauses"
          onPress={() =>
            toast('길게 눌러 일시정지', {
              duration: 4000,
            })
          }
        />
      </Section>

      <Text style={styles.footer}>
        토스트를 누르고 있는 동안 자동 dismiss 타이머가 멈춥니다. swipeToDismiss
        토스트는 위 스와이프로 즉시 닫을 수 있고, hapticFeedback 옵션은
        토스트 표시 시 기기 피드백을 발생시킵니다. 위치 버튼 6개로 스택 동작을
        확인할 수 있습니다.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#fafafa' },
  container: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 64,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#111' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#111',
    borderRadius: 8,
  },
  btnPressed: { backgroundColor: '#333' },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  darkToast: {
    borderRadius: 30,
    backgroundColor: '#333',
  },
  darkToastText: {
    color: '#fff',
  },
  footer: {
    marginTop: 32,
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
  },
});
