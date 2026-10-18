import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {
  Image as ImageIcon,
  Camera,
  FolderOpen,
  Globe,
  ChevronRight,
} from 'lucide-react-native';
import styles from '../ProductFormModal.styles';

export interface MediaSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onPickImage: () => void;
  onTakePhoto: () => void;
  onPickDocument: () => void;
  onOpenUrlInput: () => void;
}

export const MediaSelectionModal: React.FC<MediaSelectionModalProps> = ({
  visible,
  onClose,
  onPickImage,
  onTakePhoto,
  onPickDocument,
  onOpenUrlInput,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlayContainer}>
        <TouchableOpacity
          style={styles.overlayBackground}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.mediaOptionsSheet}>
          <Text style={styles.overlayTitle}>Add Garment Media</Text>
          <Text style={styles.overlaySubtitle}>Select how you want to access and select outfit photos</Text>

          <View style={styles.verticalOptionsContainer}>
            <TouchableOpacity
              style={styles.verticalOptionRow}
              onPress={onPickImage}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIconBox, { backgroundColor: '#e0f2fe' }]}>
                <ImageIcon size={20} color="#0284c7" />
              </View>
              <View style={styles.optionTextBox}>
                <Text style={styles.optionTitle}>Photo Gallery</Text>
                <Text style={styles.optionDescription}>Pick images from your device photo library</Text>
              </View>
              <ChevronRight size={16} color="#71717a" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.verticalOptionRow}
              onPress={onTakePhoto}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIconBox, { backgroundColor: '#ecfdf5' }]}>
                <Camera size={20} color="#059669" />
              </View>
              <View style={styles.optionTextBox}>
                <Text style={styles.optionTitle}>Device Camera</Text>
                <Text style={styles.optionDescription}>Take a live photo of the product</Text>
              </View>
              <ChevronRight size={16} color="#71717a" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.verticalOptionRow}
              onPress={onPickDocument}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIconBox, { backgroundColor: '#fef3c7' }]}>
                <FolderOpen size={20} color="#d97706" />
              </View>
              <View style={styles.optionTextBox}>
                <Text style={styles.optionTitle}>Document Files</Text>
                <Text style={styles.optionDescription}>Select image files from local filesystem or cloud</Text>
              </View>
              <ChevronRight size={16} color="#71717a" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.verticalOptionRow}
              onPress={onOpenUrlInput}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIconBox, { backgroundColor: '#fae8ff' }]}>
                <Globe size={20} color="#a21caf" />
              </View>
              <View style={styles.optionTextBox}>
                <Text style={styles.optionTitle}>Web Image URL</Text>
                <Text style={styles.optionDescription}>Provide a direct HTTPS link to an image</Text>
              </View>
              <ChevronRight size={16} color="#71717a" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.cancelOverlayBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelOverlayBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default MediaSelectionModal;
