import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import styles from '../ProductFormModal.styles';

export interface UrlInputModalProps {
  visible: boolean;
  url: string;
  setUrl: (url: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export const UrlInputModal: React.FC<UrlInputModalProps> = ({
  visible,
  url,
  setUrl,
  onClose,
  onSubmit,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlayContainerCenter}>
        <TouchableOpacity
          style={styles.overlayBackground}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.urlInputCard}>
          <Text style={styles.overlayTitle}>Import Web Image</Text>
          <Text style={styles.overlaySubtitle}>Paste a direct web image link</Text>

          <TextInput
            placeholder="https://example.com/image.jpg"
            value={url}
            onChangeText={setUrl}
            autoFocus
            style={styles.urlTextInput}
            placeholderTextColor="#a1a1aa"
          />

          <View style={styles.urlButtonsRow}>
            <TouchableOpacity
              style={[styles.urlButton, { backgroundColor: '#f4f4f5' }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[styles.urlButtonText, { color: '#09090b' }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.urlButton, { backgroundColor: '#FF5E36' }]}
              onPress={onSubmit}
              activeOpacity={0.7}
            >
              <Text style={[styles.urlButtonText, { color: '#ffffff' }]}>Add Image</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UrlInputModal;
