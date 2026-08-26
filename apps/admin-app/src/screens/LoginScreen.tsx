import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform 
} from 'react-native';
import { Settings, RefreshCw } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

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
  onLogin: () => void;
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
  onLogin,
  onManualSync
}: LoginScreenProps) {
  return (
    <SafeAreaView style={styles.loginContainer}>
      <StatusBar style="light" />
      <View style={styles.loginBox}>
        {/* Logo */}
        <Text style={styles.atelierLogo}>JB51</Text>
        <Text style={styles.atelierSubLogo}>A T E L I E R</Text>
        
        <View style={styles.formSpacer} />

        {/* Inputs */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput 
            placeholder="Input admin keys..."
            placeholderTextColor="#71717a"
            value={username}
            onChangeText={setUsername}
            style={styles.loginInput}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput 
            placeholder="Input access key..."
            placeholderTextColor="#71717a"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.loginInput}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity onPress={onLogin} style={styles.loginBtn}>
          <Text style={styles.loginBtnText}>Authenticate Access</Text>
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
            <TouchableOpacity onPress={onManualSync} style={styles.syncBtn}>
              <RefreshCw size={12} color="#fff" />
              <Text style={styles.syncBtnText}>{isSyncing ? 'Syncing...' : 'Ping & Sync Now'}</Text>
            </TouchableOpacity>
            <Text style={styles.syncMessageText}>{syncMessage}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    backgroundColor: '#09090b',
    justifyContent: 'center',
    alignItems: 'center',
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
