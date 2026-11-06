import { Vibration, Platform } from 'react-native';

export type HapticFeedbackType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

/**
 * Trigger platform-appropriate haptic vibration feedback.
 * Works natively on Android and iOS devices, with fallback for modern web browsers.
 */
export const triggerHaptic = (type: HapticFeedbackType = 'light'): void => {
  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        switch (type) {
          case 'selection':
          case 'light':
            navigator.vibrate(8);
            break;
          case 'medium':
            navigator.vibrate(18);
            break;
          case 'heavy':
            navigator.vibrate(35);
            break;
          case 'success':
            navigator.vibrate([12, 40, 20]);
            break;
          case 'warning':
            navigator.vibrate([25, 50, 25]);
            break;
          case 'error':
            navigator.vibrate([40, 50, 40, 50, 40]);
            break;
        }
      } catch {
        // Suppress browser permission or policy errors
      }
    }
    return;
  }

  try {
    switch (type) {
      case 'selection':
      case 'light':
        Vibration.vibrate(12);
        break;
      case 'medium':
        Vibration.vibrate(24);
        break;
      case 'heavy':
        Vibration.vibrate(45);
        break;
      case 'success':
        Vibration.vibrate([0, 15, 50, 25]);
        break;
      case 'warning':
        Vibration.vibrate([0, 30, 60, 30]);
        break;
      case 'error':
        Vibration.vibrate([0, 40, 60, 40, 60, 40]);
        break;
    }
  } catch {
    // Graceful fallback if device vibration hardware is unavailable
  }
};

