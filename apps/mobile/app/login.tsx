import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useAppDataContext } from '../src/context/AppDataContext';
import LoginScreen from '../src/screens/LoginScreen';

export default function LoginPage() {
  const auth = useAuth();
  const data = useAppDataContext();
  const router = useRouter();

  if (auth.isAuthenticated) {
    return <Redirect href="/" />;
  }

  const handleLogin = async (formData?: { email?: string; username?: string; password?: string }) => {
    await auth.handleLogin(formData);
    if (auth.isAuthenticated) {
      router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      <LoginScreen
        email={auth.email}
        setEmail={auth.setEmail}
        username={auth.username}
        setUsername={auth.setUsername}
        password={auth.password}
        setPassword={auth.setPassword}
        apiHost={auth.apiHost}
        setApiHost={auth.setApiHost}
        showConfig={auth.showConfig}
        setShowConfig={auth.setShowConfig}
        isSyncing={data.isSyncing}
        syncMessage={data.syncMessage}
        isLoggingIn={auth.isLoggingIn}
        onLogin={handleLogin}
        onManualSync={data.handleManualSync}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

