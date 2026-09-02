import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, RefreshCw, Eye, EyeOff } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useForm, Controller } from 'react-hook-form';

export interface LoginFormValues {
  username: string;
  password: string;
}

interface LoginScreenProps {
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  apiHost: string;
  setApiHost: (val: string) => void;
  showConfig: boolean;
  setShowConfig: (val: boolean) => void;
  isSyncing: boolean;
  syncMessage: string;
  isLoggingIn?: boolean;
  onLogin: (data?: LoginFormValues) => void;
  onManualSync: () => void;
}

export default function LoginScreen({
  username,
  setUsername,
  password,
  setPassword,
  apiHost,
  setApiHost,
  showConfig,
  setShowConfig,
  isSyncing,
  syncMessage,
  isLoggingIn,
  onLogin,
  onManualSync
}: LoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    defaultValues: {
      username: username || '',
      password: password || '',
    }
  });

  const onSubmit = (data: LoginFormValues) => {
    setUsername(data.username);
    setPassword(data.password);
    onLogin(data);
  };

  return (
    <SafeAreaView style={styles.loginContainer}>
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.loginBox}>
              {/* Logo */}
              <Text style={styles.atelierLogo}>JB51</Text>
              <Text style={styles.atelierSubLogo}>A T E L I E R</Text>
              
              <View style={styles.formSpacer} />

              {/* Inputs managed by react-hook-form */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username</Text>
                <Controller
                  control={control}
                  name="username"
                  rules={{ required: 'Username is required' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput 
                      placeholder="Input admin keys..."
                      placeholderTextColor="#71717a"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={(val) => {
                        onChange(val);
                        setUsername(val);
                      }}
                      style={[styles.loginInput, errors.username && styles.inputError]}
                      autoCapitalize="none"
                    />
                  )}
                />
                {errors.username && (
                  <Text style={styles.errorText}>{errors.username.message}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <Controller
                  control={control}
                  name="password"
                  rules={{ required: 'Password is required' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.passwordWrapper}>
                      <TextInput 
                        placeholder="Input access key..."
                        placeholderTextColor="#71717a"
                        secureTextEntry={!showPassword}
                        value={value}
                        onBlur={onBlur}
                        onChangeText={(val) => {
                          onChange(val);
                          setPassword(val);
                        }}
                        style={[styles.loginInput, styles.passwordInput, errors.password && styles.inputError]}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity 
                        onPress={() => setShowPassword(prev => !prev)}
                        style={styles.eyeBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff size={18} color="#a1a1aa" />
                        ) : (
                          <Eye size={18} color="#a1a1aa" />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                />
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password.message}</Text>
                )}
              </View>

              <TouchableOpacity 
                onPress={handleSubmit(onSubmit)} 
                disabled={isLoggingIn}
                style={[styles.loginBtn, isLoggingIn && { opacity: 0.7 }]}
              >
                <Text style={styles.loginBtnText}>
                  {isLoggingIn ? 'Authenticating...' : 'Authenticate Access'}
                </Text>
              </TouchableOpacity>

              {/* Configurations toggle */}
              <TouchableOpacity 
                onPress={() => setShowConfig(!showConfig)}
                style={styles.configToggle}
              >
                <Settings size={14} color="#71717a" />
                <Text style={styles.configToggleText}>tRPC Sync Settings</Text>
              </TouchableOpacity>

              {showConfig && (
                <View style={styles.configBox}>
                  <Text style={styles.configTitle}>Backend Server Path</Text>
                  <TextInput 
                    value={apiHost}
                    onChangeText={setApiHost}
                    style={styles.configInput}
                    autoCapitalize="none"
                  />
                  <View style={styles.presetRow}>
                    <TouchableOpacity onPress={() => setApiHost('http://10.199.36.189:3001')} style={styles.presetBadge}>
                      <Text style={styles.presetBadgeText}>LAN (10.199.36.189)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setApiHost('http://10.0.2.2:3001')} style={styles.presetBadge}>
                      <Text style={styles.presetBadgeText}>Emulator (10.0.2.2)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setApiHost('http://localhost:3001')} style={styles.presetBadge}>
                      <Text style={styles.presetBadgeText}>Localhost</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={onManualSync} style={styles.syncBtn}>
                    <RefreshCw size={12} color="#fff" />
                    <Text style={styles.syncBtnText}>{isSyncing ? 'Syncing...' : 'Ping & Sync Now'}</Text>
                  </TouchableOpacity>
                  <Text style={styles.syncMessageText}>{syncMessage}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  loginBox: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#18181b',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#27272a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  atelierLogo: {
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 8,
  },
  atelierSubLogo: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FF5E36',
    textAlign: 'center',
    letterSpacing: 6,
    marginTop: 4,
  },
  formSpacer: {
    height: 32,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#a1a1aa',
    marginBottom: 6,
  },
  loginInput: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'medium',
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
    right: 14,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 10,
    marginTop: 4,
  },
  loginBtn: {
    backgroundColor: '#FF5E36',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  configToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  configToggleText: {
    fontSize: 10,
    color: '#71717a',
    fontWeight: 'semibold',
  },
  configBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: '#27272a',
  },
  configTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#a1a1aa',
    marginBottom: 6,
  },
  configInput: {
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  presetBadge: {
    backgroundColor: '#27272a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  presetBadgeText: {
    color: '#a1a1aa',
    fontSize: 9,
    fontWeight: '600',
  },
  syncBtn: {
    backgroundColor: '#27272a',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  syncBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  syncMessageText: {
    fontSize: 9,
    color: '#71717a',
    textAlign: 'center',
    marginTop: 6,
  },
});
