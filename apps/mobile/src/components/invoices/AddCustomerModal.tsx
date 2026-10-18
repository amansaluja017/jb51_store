import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { UserPlus, X } from 'lucide-react-native';
import styles from '../../screens/InvoiceScreen.styles';

interface AddCustomerModalProps {
  visible: boolean;
  onClose: () => void;
  name: string;
  setName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  isSaving: boolean;
  onSave: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  visible,
  onClose,
  name,
  setName,
  phone,
  setPhone,
  email,
  setEmail,
  address,
  setAddress,
  isSaving,
  onSave,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.customerModalCard}>
          <View style={styles.customerModalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <UserPlus size={18} color="#FF5E36" style={{ marginRight: 8 }} />
              <Text style={styles.customerModalTitle}>Add Customer Manually</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#71717a" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20 }}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                placeholder="e.g. Aditi Sharma"
                placeholderTextColor="#a1a1aa"
                value={name}
                onChangeText={setName}
                style={styles.textInput}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                placeholder="e.g. +91 98765 43210"
                placeholderTextColor="#a1a1aa"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                style={styles.textInput}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                placeholder="e.g. aditi@gmail.com"
                placeholderTextColor="#a1a1aa"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.textInput}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                placeholder="e.g. Flat 402, Signature Tower, Pune"
                placeholderTextColor="#a1a1aa"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={2}
                style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
              />
            </View>

            <TouchableOpacity
              onPress={onSave}
              disabled={isSaving}
              style={[styles.generateButton, { marginTop: 12 }]}
            >
              {isSaving ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.generateButtonText}>Save & Select Customer</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddCustomerModal;
