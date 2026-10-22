import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  User,
  Mail,
  KeyRound,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  AtSign,
  Shield,
  Lock,
  Sparkles,
  Info,
  Server,
} from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';
import styles from './AccountSettingsModal.styles';

export interface AccountSettingsModalProps {
  visible: boolean;
  user: { id?: string; email?: string; userName?: string; role?: string } | null;
  onClose: () => void;
  onChangeUsername: (newUserName: string) => Promise<void>;
  onChangeEmail: (newEmail: string) => Promise<void>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  showAlert: (
    title: string,
    message: string,
    type: 'info' | 'success' | 'error' | 'confirm',
    onConfirm?: () => void
  ) => void;
}

interface UsernameFormValues {
  newUserName: string;
}

interface EmailFormValues {
  newEmail: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type SettingsView = 'main' | 'username' | 'email' | 'password';

export default function AccountSettingsModal({
  visible,
  user,
  onClose,
  onChangeUsername,
  onChangeEmail,
  onChangePassword,
  showAlert,
}: AccountSettingsModalProps) {
  const [currentView, setCurrentView] = useState<SettingsView>('main');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forms
  const usernameForm = useForm<UsernameFormValues>({
    defaultValues: { newUserName: user?.userName || '' },
  });

  const emailForm = useForm<EmailFormValues>({
    defaultValues: { newEmail: user?.email || '' },
  });

  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (visible) {
      setCurrentView('main');
      if (user?.userName) usernameForm.reset({ newUserName: user.userName });
      if (user?.email) emailForm.reset({ newEmail: user.email });
      passwordForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  }, [visible, user?.userName, user?.email]);

  const handleUsernameSubmit = async (data: UsernameFormValues) => {
    const trimmed = data.newUserName.trim();
    if (trimmed === user?.userName) {
      showAlert('No Changes', 'This is already your current username.', 'info');
      return;
    }
    setIsSubmitting(true);
    try {
      await onChangeUsername(trimmed);
      showAlert('Username Updated', 'Your username has been successfully updated.', 'success');
      setCurrentView('main');
    } catch (err: any) {
      showAlert('Update Failed', err.message || 'Failed to update username.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (data: EmailFormValues) => {
    const trimmed = data.newEmail.trim().toLowerCase();
    if (trimmed === user?.email?.toLowerCase()) {
      showAlert('No Changes', 'This is already your current email address.', 'info');
      return;
    }
    setIsSubmitting(true);
    try {
      await onChangeEmail(trimmed);
      showAlert('Email Updated', 'Your email address has been successfully updated.', 'success');
      setCurrentView('main');
    } catch (err: any) {
      showAlert('Update Failed', err.message || 'Failed to update email address.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormValues) => {
    if (data.newPassword !== data.confirmPassword) {
      showAlert('Mismatch', 'New password and confirmation password do not match.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await onChangePassword(data.currentPassword, data.newPassword);
      showAlert('Password Updated', 'Your password has been successfully updated.', 'success');
      passwordForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setCurrentView('main');
    } catch (err: any) {
      showAlert('Update Failed', err.message || 'Failed to update password.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'A';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalShell}>
        {/* Dynamic Header */}
        <View style={styles.modalHeader}>
          {currentView === 'main' ? (
            <View style={styles.headerLeftGroup}>
              <View style={styles.headerIconWrap}>
                <ShieldCheck size={20} color="#FF5E36" />
              </View>
              <View style={styles.headerTextWrap}>
                <Text style={styles.modalTitle}>Account & Security</Text>
                <Text style={styles.modalSubtitle}>Atelier Admin Credentials</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setCurrentView('main')}
              style={styles.backBtn}
              activeOpacity={0.7}
              accessibilityLabel="Back to Account"
              accessibilityRole="button"
            >
              <ChevronLeft size={18} color="#09090b" />
              <Text style={styles.backBtnText}>Account</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onClose}
            style={styles.closeHeaderBtn}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <X size={18} color="#09090b" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalScrollPadding}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* VIEW 1: MAIN DASHBOARD */}
            {currentView === 'main' && (
              <>
                {/* Hero Profile Card */}
                <View style={styles.profileHeroCard}>
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{getInitials(user?.userName)}</Text>
                    </View>
                    <View style={styles.avatarBadge}>
                      <Sparkles size={11} color="#FFFFFF" />
                    </View>
                  </View>

                  <Text style={styles.profileName}>{user?.userName || 'Administrator'}</Text>
                  <Text style={styles.profileEmail}>
                    {user?.email || 'admin@internal.store'}
                  </Text>

                  <View style={styles.badgeRow}>
                    <View style={styles.roleBadge}>
                      <ShieldCheck size={12} color="#FF5E36" />
                      <Text style={styles.roleBadgeText}>
                        {(user?.role || 'SUPER ADMIN').toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusBadgeText}>ACTIVE SESSION</Text>
                    </View>
                  </View>
                </View>

                {/* Section: Profile & Identity */}
                <Text style={styles.sectionLabel}>ADMIN IDENTITY</Text>
                <View style={styles.sectionCard}>
                  {/* Username Row */}
                  <TouchableOpacity
                    style={styles.actionRow}
                    onPress={() => setCurrentView('username')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.actionIconBox}>
                      <AtSign size={18} color="#09090b" />
                    </View>
                    <View style={styles.actionTextBox}>
                      <Text style={styles.actionTitle}>Username Handle</Text>
                      <Text style={styles.actionSub}>@{user?.userName || 'admin'}</Text>
                    </View>
                    <View style={styles.actionRight}>
                      <View style={styles.editChip}>
                        <Text style={styles.editChipText}>Edit</Text>
                      </View>
                      <ChevronRight size={16} color="#a1a1aa" />
                    </View>
                  </TouchableOpacity>

                  <View style={styles.divider} />

                  {/* Email Row */}
                  <TouchableOpacity
                    style={styles.actionRow}
                    onPress={() => setCurrentView('email')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.actionIconBox}>
                      <Mail size={18} color="#09090b" />
                    </View>
                    <View style={styles.actionTextBox}>
                      <Text style={styles.actionTitle}>Email Address</Text>
                      <Text style={styles.actionSub} numberOfLines={1}>
                        {user?.email || 'Not configured'}
                      </Text>
                    </View>
                    <View style={styles.actionRight}>
                      <View style={styles.editChip}>
                        <Text style={styles.editChipText}>Edit</Text>
                      </View>
                      <ChevronRight size={16} color="#a1a1aa" />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Section: Security & Access */}
                <Text style={styles.sectionLabel}>AUTHENTICATION & SECURITY</Text>
                <View style={styles.sectionCard}>
                  {/* Password Row */}
                  <TouchableOpacity
                    style={styles.actionRow}
                    onPress={() => setCurrentView('password')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.actionIconBox}>
                      <KeyRound size={18} color="#09090b" />
                    </View>
                    <View style={styles.actionTextBox}>
                      <Text style={styles.actionTitle}>Account Password</Text>
                      <Text style={styles.actionSub}>•••••••••••• (Encrypted)</Text>
                    </View>
                    <View style={styles.actionRight}>
                      <View style={styles.editChip}>
                        <Text style={styles.editChipText}>Update</Text>
                      </View>
                      <ChevronRight size={16} color="#a1a1aa" />
                    </View>
                  </TouchableOpacity>

                  <View style={styles.divider} />

                  {/* Access Level Row */}
                  <View style={styles.actionRow}>
                    <View style={styles.actionIconBox}>
                      <Shield size={18} color="#FF5E36" />
                    </View>
                    <View style={styles.actionTextBox}>
                      <Text style={styles.actionTitle}>Privilege Scope</Text>
                      <Text style={styles.actionSub}>
                        Full Store Access (Products, Invoices, Customers)
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Section: System Info */}
                <Text style={styles.sectionLabel}>SYSTEM ENVIRONMENT</Text>
                <View style={styles.sectionCard}>
                  <View style={styles.actionRow}>
                    <View style={styles.actionIconBox}>
                      <Server size={18} color="#71717a" />
                    </View>
                    <View style={styles.actionTextBox}>
                      <Text style={styles.actionTitle}>JB51 Atelier Portal</Text>
                      <Text style={styles.actionSub}>Version 2.4 • Production API Connected</Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* VIEW 2: CHANGE USERNAME */}
            {currentView === 'username' && (
              <View style={styles.formCard}>
                <View style={styles.formIntroRow}>
                  <View style={styles.formIntroIconBox}>
                    <AtSign size={20} color="#FF5E36" />
                  </View>
                  <View style={styles.formIntroTextWrap}>
                    <Text style={styles.cardHeaderTitle}>Update Username</Text>
                    <Text style={styles.cardHeaderSubtitle}>
                      Your handle uniquely identifies administrative actions on invoices and catalogue items.
                    </Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>NEW USERNAME HANDLE</Text>
                  <Controller
                    control={usernameForm.control}
                    name="newUserName"
                    rules={{
                      required: 'Username is required',
                      minLength: { value: 3, message: 'Minimum 3 characters required' },
                      maxLength: { value: 50, message: 'Maximum 50 characters allowed' },
                      pattern: {
                        value: /^[a-zA-Z0-9_-]+$/,
                        message: 'Only letters, numbers, underscores, and hyphens permitted',
                      },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View
                        style={[
                          styles.inputContainer,
                          usernameForm.formState.errors.newUserName && styles.inputError,
                        ]}
                      >
                        <User size={16} color="#71717a" style={styles.inputLeadingIcon} />
                        <TextInput
                          placeholder="e.g. aman_admin"
                          placeholderTextColor="#a1a1aa"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          style={styles.modalInput}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                    )}
                  />
                  {usernameForm.formState.errors.newUserName && (
                    <Text style={styles.errorText}>
                      {usernameForm.formState.errors.newUserName.message}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={usernameForm.handleSubmit(handleUsernameSubmit)}
                  disabled={isSubmitting}
                  style={styles.submitBtn}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Check size={16} color="#FFFFFF" />
                      <Text style={styles.submitBtnText}>Save Username</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setCurrentView('main')}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <View style={styles.infoNoteBox}>
                  <Info size={14} color="#64748B" />
                  <Text style={styles.infoNoteText}>
                    Changing your username does not reset your login credentials.
                  </Text>
                </View>
              </View>
            )}

            {/* VIEW 3: CHANGE EMAIL */}
            {currentView === 'email' && (
              <View style={styles.formCard}>
                <View style={styles.formIntroRow}>
                  <View style={styles.formIntroIconBox}>
                    <Mail size={20} color="#FF5E36" />
                  </View>
                  <View style={styles.formIntroTextWrap}>
                    <Text style={styles.cardHeaderTitle}>Update Email Address</Text>
                    <Text style={styles.cardHeaderSubtitle}>
                      Enter a new administrative email for authentication and critical security alerts.
                    </Text>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>NEW EMAIL ADDRESS</Text>
                  <Controller
                    control={emailForm.control}
                    name="newEmail"
                    rules={{
                      required: 'Email address is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address format',
                      },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View
                        style={[
                          styles.inputContainer,
                          emailForm.formState.errors.newEmail && styles.inputError,
                        ]}
                      >
                        <Mail size={16} color="#71717a" style={styles.inputLeadingIcon} />
                        <TextInput
                          placeholder="e.g. admin@jb51.com"
                          placeholderTextColor="#a1a1aa"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          keyboardType="email-address"
                          style={styles.modalInput}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                    )}
                  />
                  {emailForm.formState.errors.newEmail && (
                    <Text style={styles.errorText}>
                      {emailForm.formState.errors.newEmail.message}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={emailForm.handleSubmit(handleEmailSubmit)}
                  disabled={isSubmitting}
                  style={styles.submitBtn}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Check size={16} color="#FFFFFF" />
                      <Text style={styles.submitBtnText}>Save Email Address</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setCurrentView('main')}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <View style={styles.infoNoteBox}>
                  <Info size={14} color="#64748B" />
                  <Text style={styles.infoNoteText}>
                    You will use this new email to log into the mobile app next time.
                  </Text>
                </View>
              </View>
            )}

            {/* VIEW 4: CHANGE PASSWORD */}
            {currentView === 'password' && (
              <View style={styles.formCard}>
                <View style={styles.formIntroRow}>
                  <View style={styles.formIntroIconBox}>
                    <Lock size={20} color="#FF5E36" />
                  </View>
                  <View style={styles.formIntroTextWrap}>
                    <Text style={styles.cardHeaderTitle}>Update Password</Text>
                    <Text style={styles.cardHeaderSubtitle}>
                      Verify your identity with your current password, then specify a secure new password.
                    </Text>
                  </View>
                </View>

                {/* Current Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>CURRENT PASSWORD</Text>
                  <Controller
                    control={passwordForm.control}
                    name="currentPassword"
                    rules={{ required: 'Current password is required' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View
                        style={[
                          styles.inputContainer,
                          passwordForm.formState.errors.currentPassword && styles.inputError,
                        ]}
                      >
                        <Lock size={16} color="#71717a" style={styles.inputLeadingIcon} />
                        <TextInput
                          placeholder="Enter your current password..."
                          placeholderTextColor="#a1a1aa"
                          secureTextEntry={!showCurrentPassword}
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          style={[styles.modalInput, styles.passwordInput]}
                          autoCapitalize="none"
                        />
                        <TouchableOpacity
                          onPress={() => setShowCurrentPassword(p => !p)}
                          style={styles.eyeBtn}
                        >
                          {showCurrentPassword ? (
                            <EyeOff size={18} color="#71717a" />
                          ) : (
                            <Eye size={18} color="#71717a" />
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <Text style={styles.errorText}>
                      {passwordForm.formState.errors.currentPassword.message}
                    </Text>
                  )}
                </View>

                {/* New Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>NEW PASSWORD (MIN. 6 CHARACTERS)</Text>
                  <Controller
                    control={passwordForm.control}
                    name="newPassword"
                    rules={{
                      required: 'New password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters long',
                      },
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View
                        style={[
                          styles.inputContainer,
                          passwordForm.formState.errors.newPassword && styles.inputError,
                        ]}
                      >
                        <KeyRound size={16} color="#71717a" style={styles.inputLeadingIcon} />
                        <TextInput
                          placeholder="Create a strong password..."
                          placeholderTextColor="#a1a1aa"
                          secureTextEntry={!showNewPassword}
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          style={[styles.modalInput, styles.passwordInput]}
                          autoCapitalize="none"
                        />
                        <TouchableOpacity
                          onPress={() => setShowNewPassword(p => !p)}
                          style={styles.eyeBtn}
                        >
                          {showNewPassword ? (
                            <EyeOff size={18} color="#71717a" />
                          ) : (
                            <Eye size={18} color="#71717a" />
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <Text style={styles.errorText}>
                      {passwordForm.formState.errors.newPassword.message}
                    </Text>
                  )}
                </View>

                {/* Confirm New Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>CONFIRM NEW PASSWORD</Text>
                  <Controller
                    control={passwordForm.control}
                    name="confirmPassword"
                    rules={{
                      required: 'Please confirm your new password',
                    }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View
                        style={[
                          styles.inputContainer,
                          passwordForm.formState.errors.confirmPassword && styles.inputError,
                        ]}
                      >
                        <KeyRound size={16} color="#71717a" style={styles.inputLeadingIcon} />
                        <TextInput
                          placeholder="Re-enter your new password..."
                          placeholderTextColor="#a1a1aa"
                          secureTextEntry={!showConfirmPassword}
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          style={[styles.modalInput, styles.passwordInput]}
                          autoCapitalize="none"
                        />
                        <TouchableOpacity
                          onPress={() => setShowConfirmPassword(p => !p)}
                          style={styles.eyeBtn}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} color="#71717a" />
                          ) : (
                            <Eye size={18} color="#71717a" />
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <Text style={styles.errorText}>
                      {passwordForm.formState.errors.confirmPassword.message}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={passwordForm.handleSubmit(handlePasswordSubmit)}
                  disabled={isSubmitting}
                  style={styles.submitBtn}
                  activeOpacity={0.8}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Check size={16} color="#FFFFFF" />
                      <Text style={styles.submitBtnText}>Update Password</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setCurrentView('main')}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
