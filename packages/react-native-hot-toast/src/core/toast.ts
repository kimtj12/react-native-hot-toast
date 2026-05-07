import {
  Renderable,
  Toast,
  ToastOptions,
  ToastType,
  DefaultToastOptions,
  ValueOrFunction,
  resolveValue,
} from './types';
import { genId } from './utils';
import {
  createDispatch,
  Action,
  ActionType,
  dispatchAll,
  getToasterIdFromToastId,
} from './store';

type Message = ValueOrFunction<Renderable, Toast>;

type ToastHandler = (message: Message, options?: ToastOptions) => string;

const createToast = (
  message: Message,
  type: ToastType = 'blank',
  opts?: ToastOptions
): Toast => ({
  createdAt: Date.now(),
  visible: true,
  dismissed: false,
  type,
  ariaProps: {
    role: 'status',
    'aria-live': 'polite',
  },
  message,
  pauseDuration: 0,
  ...opts,
  id: opts?.id || genId(),
});

const createHandler =
  (type?: ToastType): ToastHandler =>
  (message, options) => {
    const t = createToast(message, type, options);
    const dispatch = createDispatch(
      t.toasterId || getToasterIdFromToastId(t.id)
    );
    dispatch({ type: ActionType.UPSERT_TOAST, toast: t });
    return t.id;
  };

const toast = (message: Message, opts?: ToastOptions) =>
  createHandler('blank')(message, opts);

toast.error = createHandler('error');
toast.success = createHandler('success');
toast.loading = createHandler('loading');
toast.custom = createHandler('custom');

toast.dismiss = (toastId?: string, toasterId?: string) => {
  const action: Action = { type: ActionType.DISMISS_TOAST, toastId };
  if (toasterId) {
    createDispatch(toasterId)(action);
  } else {
    dispatchAll(action);
  }
};

toast.dismissAll = (toasterId?: string) => toast.dismiss(undefined, toasterId);

toast.remove = (toastId?: string, toasterId?: string) => {
  const action: Action = { type: ActionType.REMOVE_TOAST, toastId };
  if (toasterId) {
    createDispatch(toasterId)(action);
  } else {
    dispatchAll(action);
  }
};

toast.removeAll = (toasterId?: string) => toast.remove(undefined, toasterId);

toast.promise = <T>(
  promise: Promise<T> | (() => Promise<T>),
  msgs: {
    loading: Renderable;
    success?: ValueOrFunction<Renderable, T>;
    error?: ValueOrFunction<Renderable, unknown>;
  },
  opts?: DefaultToastOptions
) => {
  const id = toast.loading(msgs.loading, { ...opts, ...opts?.loading });

  const p = typeof promise === 'function' ? promise() : promise;

  p.then((value) => {
    const successMessage = msgs.success
      ? resolveValue(msgs.success, value)
      : undefined;

    if (successMessage) {
      toast.success(successMessage, { id, ...opts, ...opts?.success });
    } else {
      toast.dismiss(id);
    }
    return value;
  }).catch((e) => {
    const errorMessage = msgs.error ? resolveValue(msgs.error, e) : undefined;

    if (errorMessage) {
      toast.error(errorMessage, { id, ...opts, ...opts?.error });
    } else {
      toast.dismiss(id);
    }
  });

  return p;
};

export { toast };
