import { useEffect, useCallback, useRef } from 'react';
import { Vibration } from 'react-native';
import { createDispatch, ActionType, useStore, dispatch } from './store';
import { toast } from './toast';
import type { DefaultToastOptions, Toast, ToastPosition } from './types';

export const REMOVE_DELAY = 1000;

export const useToaster = (
  toastOptions?: DefaultToastOptions,
  toasterId: string = 'default'
) => {
  const { toasts, pausedAt } = useStore(toastOptions, toasterId);
  const toastTimeouts = useRef(
    new Map<Toast['id'], ReturnType<typeof setTimeout>>()
  ).current;
  const hapticFeedbackKeys = useRef(new Map<Toast['id'], string>()).current;

  const addToRemoveQueue = useCallback(
    (toastId: string, removeDelay = REMOVE_DELAY) => {
      if (toastTimeouts.has(toastId)) return;

      const timeout = setTimeout(() => {
        toastTimeouts.delete(toastId);
        dispatch({ type: ActionType.REMOVE_TOAST, toastId });
      }, removeDelay);

      toastTimeouts.set(toastId, timeout);
    },
    [toastTimeouts]
  );

  useEffect(() => {
    if (pausedAt) return;

    const now = Date.now();
    const timeouts = toasts.map((t) => {
      if (t.duration === Infinity) return;

      const durationLeft =
        (t.duration || 0) + t.pauseDuration - (now - t.createdAt);

      if (durationLeft < 0) {
        if (t.visible) toast.dismiss(t.id);
        return;
      }
      return setTimeout(() => toast.dismiss(t.id, toasterId), durationLeft);
    });

    return () => {
      timeouts.forEach((timeout) => timeout && clearTimeout(timeout));
    };
  }, [toasts, pausedAt, toasterId]);

  const localDispatch = useCallback(createDispatch(toasterId), [toasterId]);

  const startPause = useCallback(() => {
    localDispatch({ type: ActionType.START_PAUSE, time: Date.now() });
  }, [localDispatch]);

  const updateHeight = useCallback(
    (toastId: string, height: number) => {
      localDispatch({
        type: ActionType.UPDATE_TOAST,
        toast: { id: toastId, height },
      });
    },
    [localDispatch]
  );

  const endPause = useCallback(() => {
    if (pausedAt) {
      localDispatch({ type: ActionType.END_PAUSE, time: Date.now() });
    }
  }, [pausedAt, localDispatch]);

  const calculateOffset = useCallback(
    (
      toastItem: Toast,
      opts?: {
        reverseOrder?: boolean;
        gutter?: number;
        defaultPosition?: ToastPosition;
      }
    ) => {
      const { reverseOrder = false, gutter = 8, defaultPosition } = opts || {};

      const relevantToasts = toasts.filter(
        (t) =>
          (t.position || defaultPosition) ===
            (toastItem.position || defaultPosition) && t.height
      );
      const toastIndex = relevantToasts.findIndex(
        (t) => t.id === toastItem.id
      );
      const toastsBefore = relevantToasts.filter(
        (t, i) => i < toastIndex && t.visible
      ).length;

      const offset = relevantToasts
        .filter((t) => t.visible)
        .slice(...(reverseOrder ? [toastsBefore + 1] : [0, toastsBefore]))
        .reduce((acc, t) => acc + (t.height || 0) + gutter, 0);

      return offset;
    },
    [toasts]
  );

  useEffect(() => {
    toasts.forEach((t) => {
      if (t.dismissed) {
        addToRemoveQueue(t.id, t.removeDelay);
      } else {
        const timeout = toastTimeouts.get(t.id);
        if (timeout) {
          clearTimeout(timeout);
          toastTimeouts.delete(t.id);
        }
      }
    });
  }, [toasts, addToRemoveQueue, toastTimeouts]);

  useEffect(() => {
    const activeToastIds = new Set(toasts.map((t) => t.id));
    hapticFeedbackKeys.forEach((_, toastId) => {
      if (!activeToastIds.has(toastId)) {
        hapticFeedbackKeys.delete(toastId);
      }
    });

    toasts.forEach((t) => {
      if (!t.visible || !t.hapticFeedback) return;

      const feedbackKey = `${t.createdAt}:${t.type}`;
      if (hapticFeedbackKeys.get(t.id) === feedbackKey) return;

      hapticFeedbackKeys.set(t.id, feedbackKey);

      if (typeof t.hapticFeedback === 'function') {
        t.hapticFeedback(t);
      } else {
        Vibration.vibrate(10);
      }
    });
  }, [toasts, hapticFeedbackKeys]);

  return {
    toasts,
    handlers: {
      updateHeight,
      startPause,
      endPause,
      calculateOffset,
    },
  };
};
