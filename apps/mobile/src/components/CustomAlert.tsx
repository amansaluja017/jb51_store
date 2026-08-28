import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react-native';

export interface CustomAlertConfig {
  visible: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'confirm';
  onConfirm?: () => void;
}

interface CustomAlertProps {
  config: CustomAlertConfig;
  onClose: () => void;
}

export default function CustomAlert({ config, onClose }: CustomAlertProps) {
  const getIcon = () => {
    switch (config.type) {
      case 'success':
        return <CheckCircle size={28} color="#10b981" />;
      case 'error':
        return <XCircle size={28} color="#ef4444" />;
      case 'confirm':
        return <AlertTriangle size={28} color="#FF5E36" />;
      default:
        return <Info size={28} color="#3b82f6" />;
    }
  };

  const handleConfirm = () => {
    onClose();
    if (config.onConfirm) {
      config.onConfirm();
    }
  };

  return (
    <Modal
      visible={config.visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.alertBox}>
          {/* Top Icon indicator */}
          <View style={styles.iconContainer}>
            {getIcon()}
          </View>

          {/* Title & Message */}
          <Text style={styles.alertTitle}>{config.title}</Text>
          <Text style={styles.alertMessage}>{config.message}</Text>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            {config.type === 'confirm' ? (
              <>
                <TouchableOpacity 
                  onPress={onClose} 
                  style={[styles.btn, styles.btnCancel]}
                >
                  <Text style={styles.btnCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleConfirm} 
                  style={[styles.btn, styles.btnConfirm]}
                >
                  <Text style={styles.btnConfirmText}>Confirm</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                onPress={onClose} 
                style={[styles.btn, styles.btnOk]}
              >
                <Text style={styles.btnOkText}>Dismiss</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 11, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertBox: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f4f4f5',
  },
  alertTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#09090b',
    textAlign: 'center',
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 11,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnCancel: {
    borderColor: '#e4e4e7',
    backgroundColor: '#ffffff',
  },
  btnCancelText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#71717a',
    textTransform: 'uppercase',
  },
  btnConfirm: {
    borderColor: '#FF5E36',
    backgroundColor: '#FF5E36',
  },
  btnConfirmText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  btnOk: {
    borderColor: '#09090b',
    backgroundColor: '#09090b',
  },
  btnOkText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
});
