import type {
  AccessibilityRole,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';

export type ToastType = 'success' | 'error' | 'loading' | 'blank' | 'custom';

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type Renderable = React.ReactNode;

export interface IconTheme {
  primary: string;
  secondary: string;
}

export type ValueFunction<TValue, TArg> = (arg: TArg) => TValue;
export type ValueOrFunction<TValue, TArg> =
  | TValue
  | ValueFunction<TValue, TArg>;

const isFunction = <TValue, TArg>(
  valOrFunction: ValueOrFunction<TValue, TArg>
): valOrFunction is ValueFunction<TValue, TArg> =>
  typeof valOrFunction === 'function';

export const resolveValue = <TValue, TArg>(
  valOrFunction: ValueOrFunction<TValue, TArg>,
  arg: TArg
): TValue => (isFunction(valOrFunction) ? valOrFunction(arg) : valOrFunction);

export interface AriaProps {
  role: 'status' | 'alert';
  'aria-live': 'assertive' | 'off' | 'polite';
}

export interface Toast {
  type: ToastType;
  id: string;
  toasterId?: string;
  message: ValueOrFunction<Renderable, Toast>;
  icon?: Renderable;
  duration?: number;
  pauseDuration: number;
  position?: ToastPosition;
  removeDelay?: number;

  ariaProps: AriaProps;
  accessibilityRole?: AccessibilityRole;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';

  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconStyle?: StyleProp<ViewStyle>;
  iconTheme?: IconTheme;

  hapticFeedback?: boolean | ((toast: Toast) => void);
  pauseOnPressIn?: boolean;
  swipeToDismiss?: boolean;

  createdAt: number;
  visible: boolean;
  dismissed: boolean;
  height?: number;
}

export type ToastOptions = Partial<
  Pick<
    Toast,
    | 'id'
    | 'icon'
    | 'duration'
    | 'ariaProps'
    | 'accessibilityRole'
    | 'accessibilityLiveRegion'
    | 'style'
    | 'textStyle'
    | 'iconStyle'
    | 'position'
    | 'iconTheme'
    | 'toasterId'
    | 'removeDelay'
    | 'hapticFeedback'
    | 'pauseOnPressIn'
    | 'swipeToDismiss'
  >
>;

export type DefaultToastOptions = ToastOptions & {
  [key in ToastType]?: ToastOptions;
};

export interface ToasterProps {
  position?: ToastPosition;
  toastOptions?: DefaultToastOptions;
  reverseOrder?: boolean;
  gutter?: number;
  containerStyle?: StyleProp<ViewStyle>;
  toasterId?: string;
  useSafeArea?: boolean;
  pauseOnPressIn?: boolean;
  swipeToDismiss?: boolean;
  children?: (toast: Toast) => React.ReactElement;
}

export interface ToastWrapperProps {
  id: string;
  style?: StyleProp<ViewStyle>;
  onHeightUpdate: (id: string, height: number) => void;
  children?: React.ReactNode;
}
