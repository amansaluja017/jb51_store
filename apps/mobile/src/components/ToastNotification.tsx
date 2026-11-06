import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react-native';
import { triggerHaptic, HapticFeedbackType } from '../utils/haptics';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  visible: boolean;
  title: string;
  message?: string;
  type?: ToastType;
  durationMs?: number;
}

interface ToastNotificationProps {
  config: ToastConfig;
  onDismiss: () => void;
}

export default function ToastNotification({ config, onDismiss }: ToastNotificationProps) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (config.visible) {
      // Trigger corresponding haptic sensation
      const hapticMap: Record<ToastType, HapticFeedbackType> = {
        success: 'success',
        error: 'error',
        warning: 'warning',
        info: 'light',
      };
      triggerHaptic(hapticMap[config.type || 'info']);

      // Spring-in animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 18,
          stiffness: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Clear previous timer if any
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Schedule auto-dismiss
      const timeout = config.durationMs ?? 3200;
      timerRef.current = setTimeout(() => {
        dismissToast();
      }, timeout);
    } else {
      dismissToast();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [config.visible, config.title, config.message]);

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!config.visible) return null;

  const type = config.type || 'info';

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="#10b981" />;
      case 'error':
        return <XCircle size={18} color="#ef4444" />;
      case 'warning':
        return <AlertTriangle size={18} color="#f59e0b" />;
      case 'info':
      default:
        return <Info size={18} color="#3b82f6" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return '#a7f3d0';
      case 'error':
        return '#fecaca';
      case 'warning':
        return '#fde68a';
      case 'info':
      default:
        return '#bfdbfe';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return '#f0fdf4';
      case 'error':
        return '#fef2f2';
      case 'warning':
        return '#fffbeb';
      case 'info':
      default:
        return '#eff6ff';
    }
  };

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={[
          styles.toastCard,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBgColor(),
          },
        ]}
        onPress={dismissToast}
        activeOpacity={0.9}
        accessibilityRole="alert"
      >
        <View style={styles.iconContainer}>{getIcon()}</View>
        <View style={styles.textContainer}>
          <Text style={styles.toastTitle}>{config.title}</Text>
          {config.message ? (
            <Text style={styles.toastMessage} numberOfLines={2}>
              {config.message}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={dismissToast}
          style={styles.closeBtn}
          accessibilityLabel="Dismiss notification"
          accessibilityRole="button"
        >
          <X size={14} color="#71717a" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 36,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastCard: {
    width: '100%',
    maxWidth: 480,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },
  iconContainer: {
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  toastTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
    letterSpacing: -0.2,
  },
  toastMessage: {
    fontSize: 11,
    color: '#52525b',
    marginTop: 2,
    lineHeight: 15,
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

