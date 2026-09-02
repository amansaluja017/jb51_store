import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, User, Mail, KeyRound, Check, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import { useForm, Controller } from 'react-hook-form';

interface AccountSettingsModalProps {
  visible: boolean;
  user: { id?: string; email?: string; userName?: string; role?: string } | null;
  onClose: () => void;
  onChangeUsername: (newUserName: string) => Promise<void>;
  onChangeEmail: (newEmail: string) => Promise<void>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  showAlert: (title: string, message: string, type: 'info' | 'success' | 'error' | 'confirm', onConfirm?: () => void) => void;
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
}

export default function AccountSettingsModal({
  visible,
  user,
  onClose,
  onChangeUsername,
  onChangeEmail,
  onChangePassword,
  showAlert
}: AccountSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'email' | 'username' | 'password'>('profile');
  const [isSubmittingUsername, setIsSubmittingUsername] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Username form
  const usernameForm = useForm<UsernameFormValues>({
    defaultValues: {
      newUserName: user?.userName || '',
    }
  });

  // Email form
  const emailForm = useForm<EmailFormValues>({
    defaultValues: {
      newEmail: user?.email || '',
    }
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    }
  });

  React.useEffect(() => {
    if (visible) {
      if (user?.userName) usernameForm.reset({ newUserName: user.userName });
      if (user?.email) emailForm.reset({ newEmail: user.email });
    }
  }, [visible, user?.userName, user?.email]);

  const handleUsernameSubmit = async (data: UsernameFormValues) => {
    setIsSubmittingUsername(true);
    try {
      await onChangeUsername(data.newUserName.trim());
      showAlert('Username Updated', 'Your username has been successfully updated.', 'success');
      setActiveTab('profile');
    } catch (err: any) {
      showAlert('Update Failed', err.message || 'Failed to update username.', 'error');
    } finally {
      setIsSubmittingUsername(false);
    }
  };

  const handleEmailSubmit = async (data: EmailFormValues) => {
    setIsSubmittingEmail(true);
    try {
      await onChangeEmail(data.newEmail.trim().toLowerCase());
      showAlert('Email Updated', 'Your email address has been successfully updated.', 'success');
      setActiveTab('profile');
    } catch (err: any) {
      showAlert('Update Failed', err.message || 'Failed to update email address.', 'error');
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormValues) => {
    setIsSubmittingPassword(true);
    try {
      await onChangePassword(data.currentPassword, data.newPassword);
      showAlert('Password Updated', 'Your password has been successfully updated.', 'success');
      passwordForm.reset();
      setActiveTab('profile');
    } catch (err: any) {
      showAlert('Update Failed', err.message || 'Failed to update password.', 'error');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalShell}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <View style={styles.headerTitleGroup}>
            <ShieldCheck size={20} color="#FF5E36" />
            <Text style={styles.modalTitle}>Account & Security</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeHeaderBtn}>
            <X size={20} color="#09090b" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            onPress={() => setActiveTab('profile')} 
            style={[styles.tabButton, activeTab === 'profile' && styles.activeTabButton]}
          >
            <User size={16} color={activeTab === 'profile' ? '#FF5E36' : '#71717a'} />
            <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setActiveTab('email')} 
            style={[styles.tabButton, activeTab === 'email' && styles.activeTabButton]}
          >
            <Mail size={16} color={activeTab === 'email' ? '#FF5E36' : '#71717a'} />
            <Text style={[styles.tabText, activeTab === 'email' && styles.activeTabText]}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setActiveTab('username')} 
            style={[styles.tabButton, activeTab === 'username' && styles.activeTabButton]}
          >
            <User size={16} color={activeTab === 'username' ? '#FF5E36' : '#71717a'} />
            <Text style={[styles.tabText, activeTab === 'username' && styles.activeTabText]}>Username</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setActiveTab('password')} 
            style={[styles.tabButton, activeTab === 'password' && styles.activeTabButton]}
          >
            <KeyRound size={16} color={activeTab === 'password' ? '#FF5E36' : '#71717a'} />
            <Text style={[styles.tabText, activeTab === 'password' && styles.activeTabText]}>Password</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView 
              style={styles.modalBody} 
              contentContainerStyle={styles.modalScrollPadding}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              
              {/* TAB 1: PROFILE OVERVIEW */}
              {activeTab === 'profile' && (
                <View style={styles.tabContentContainer}>
                  <View style={styles.profileHeroCard}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {(user?.userName || 'A').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.profileName}>{user?.userName || 'Admin User'}</Text>
                    <Text style={styles.profileEmail}>{user?.email || 'admin@admin.com'}</Text>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>{(user?.role || 'admin').toUpperCase()}</Text>
                    </View>
                  </View>

                  {/* Actions List */}
                  <View style={styles.sectionCard}>
                    <Text style={styles.cardHeaderTitle}>Security Actions</Text>

                    <TouchableOpacity 
                      onPress={() => setActiveTab('email')}
                      style={styles.actionRow}
                    >
                      <View style={styles.actionIconBox}>
                        <Mail size={16} color="#09090b" />
                      </View>
                      <View style={styles.actionTextBox}>
                        <Text style={styles.actionTitle}>Change Email</Text>
                        <Text style={styles.actionSub}>Current: {user?.email || 'admin@admin.com'}</Text>
                      </View>
                    </TouchableOpacity>
                    
                    <View style={styles.divider} />

                    <TouchableOpacity 
                      onPress={() => setActiveTab('username')}
                      style={styles.actionRow}
                    >
                      <View style={styles.actionIconBox}>
                        <User size={16} color="#09090b" />
                      </View>
                      <View style={styles.actionTextBox}>
                        <Text style={styles.actionTitle}>Change Username</Text>
                        <Text style={styles.actionSub}>Current: @{user?.userName || 'admin'}</Text>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity 
                      onPress={() => setActiveTab('password')}
                      style={styles.actionRow}
                    >
                      <View style={styles.actionIconBox}>
                        <KeyRound size={16} color="#09090b" />
                      </View>
                      <View style={styles.actionTextBox}>
                        <Text style={styles.actionTitle}>Change Password</Text>
                        <Text style={styles.actionSub}>Update access credentials securely</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* TAB 2: CHANGE EMAIL */}
              {activeTab === 'email' && (
                <View style={styles.tabContentContainer}>
                  <View style={styles.sectionCard}>
                    <Text style={styles.cardHeaderTitle}>Update Email Address</Text>
                    <Text style={styles.cardHeaderSubtitle}>
                      Enter a new valid email address for account notifications and administrative recovery.
                    </Text>

                    <View style={styles.inputGroup}>
                      <Text style={styles.fieldLabel}>New Email Address</Text>
                      <Controller
                        control={emailForm.control}
                        name="newEmail"
                        rules={{ 
                          required: 'Email address is required',
                          pattern: { 
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                            message: 'Invalid email address format' 
                          }
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput 
                            placeholder="Enter new email address..."
                            placeholderTextColor="#a1a1aa"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            keyboardType="email-address"
                            style={[
                              styles.modalInput, 
                              emailForm.formState.errors.newEmail && styles.inputError
                            ]}
                            autoCapitalize="none"
                          />
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
                      disabled={isSubmittingEmail}
                      style={[styles.submitBtn, isSubmittingEmail && { opacity: 0.7 }]}
                    >
                      <Text style={styles.submitBtnText}>
                        {isSubmittingEmail ? 'Updating...' : 'Save New Email'}
                      </Text>
                      <Check size={14} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* TAB 3: CHANGE USERNAME */}
              {activeTab === 'username' && (
                <View style={styles.tabContentContainer}>
                  <View style={styles.sectionCard}>
                    <Text style={styles.cardHeaderTitle}>Update Username</Text>
                    <Text style={styles.cardHeaderSubtitle}>
                      Enter a new handle for your admin account. Must be 3–50 characters (letters, numbers, underscores, hyphens).
                    </Text>

                    <View style={styles.inputGroup}>
                      <Text style={styles.fieldLabel}>New Username</Text>
                      <Controller
                        control={usernameForm.control}
                        name="newUserName"
                        rules={{ 
                          required: 'Username is required',
                          minLength: { value: 3, message: 'Minimum 3 characters required' },
                          maxLength: { value: 50, message: 'Maximum 50 characters allowed' },
                          pattern: { 
                            value: /^[a-zA-Z0-9_-]+$/, 
                            message: 'Letters, numbers, underscores, and hyphens only' 
                          }
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput 
                            placeholder="Enter new username..."
                            placeholderTextColor="#a1a1aa"
                            value={value}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            style={[
                              styles.modalInput, 
                              usernameForm.formState.errors.newUserName && styles.inputError
                            ]}
                            autoCapitalize="none"
                          />
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
                      disabled={isSubmittingUsername}
                      style={[styles.submitBtn, isSubmittingUsername && { opacity: 0.7 }]}
                    >
                      <Text style={styles.submitBtnText}>
                        {isSubmittingUsername ? 'Updating...' : 'Save New Username'}
                      </Text>
                      <Check size={14} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* TAB 4: CHANGE PASSWORD */}
              {activeTab === 'password' && (
                <View style={styles.tabContentContainer}>
                  <View style={styles.sectionCard}>
                    <Text style={styles.cardHeaderTitle}>Update Password</Text>
                    <Text style={styles.cardHeaderSubtitle}>
                      Enter your current password to verify identity, then provide a new password (min. 6 characters).
                    </Text>

                    {/* Current Password */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.fieldLabel}>Current Password</Text>
                      <Controller
                        control={passwordForm.control}
                        name="currentPassword"
                        rules={{ required: 'Current password is required' }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <View style={styles.passwordWrapper}>
                            <TextInput 
                              placeholder="Enter current password..."
                              placeholderTextColor="#a1a1aa"
                              secureTextEntry={!showCurrentPassword}
                              value={value}
                              onBlur={onBlur}
                              onChangeText={onChange}
                              style={[
                                styles.modalInput, 
                                styles.passwordInput,
                                passwordForm.formState.errors.currentPassword && styles.inputError
                              ]}
                              autoCapitalize="none"
                            />
                            <TouchableOpacity 
                              onPress={() => setShowCurrentPassword(prev => !prev)}
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
                      <Text style={styles.fieldLabel}>New Password</Text>
                      <Controller
                        control={passwordForm.control}
                        name="newPassword"
                        rules={{ 
                          required: 'New password is required',
                          minLength: { value: 6, message: 'Password must be at least 6 characters long' }
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <View style={styles.passwordWrapper}>
                            <TextInput 
                              placeholder="Enter new password (min. 6 chars)..."
                              placeholderTextColor="#a1a1aa"
                              secureTextEntry={!showNewPassword}
                              value={value}
                              onBlur={onBlur}
                              onChangeText={onChange}
                              style={[
                                styles.modalInput, 
                                styles.passwordInput,
                                passwordForm.formState.errors.newPassword && styles.inputError
                              ]}
                              autoCapitalize="none"
                            />
                            <TouchableOpacity 
                              onPress={() => setShowNewPassword(prev => !prev)}
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

                    <TouchableOpacity 
                      onPress={passwordForm.handleSubmit(handlePasswordSubmit)}
                      disabled={isSubmittingPassword}
                      style={[styles.submitBtn, isSubmittingPassword && { opacity: 0.7 }]}
                    >
                      <Text style={styles.submitBtnText}>
                        {isSubmittingPassword ? 'Updating...' : 'Update Password'}
                      </Text>
                      <Check size={14} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalShell: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#ffffff',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#09090b',
  },
  closeHeaderBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f4f4f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingTop: 4,
    borderBottomWidth: 1,
    borderColor: '#e4e4e7',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#FF5E36',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717a',
  },
  activeTabText: {
    color: '#FF5E36',
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
  },
  modalScrollPadding: {
    padding: 20,
  },
  tabContentContainer: {
    gap: 16,
  },
  profileHeroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#09090b',
  },
  profileEmail: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 2,
  },
  roleBadge: {
    marginTop: 10,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ffedd5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#c2410c',
    letterSpacing: 1,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#09090b',
    marginBottom: 4,
  },
  cardHeaderSubtitle: {
    fontSize: 12,
    color: '#71717a',
    marginBottom: 16,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextBox: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#09090b',
  },
  actionSub: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f4f4f5',
  },
  inputGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#3f3f46',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#09090b',
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 11,
    marginTop: 4,
  },
  submitBtn: {
    backgroundColor: '#09090b',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
