import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import styles from './LoadingScreen.styles';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading workspace...' }: LoadingScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <View style={styles.brandBox}>
          <Text style={styles.brandLogo}>JB51</Text>
          <Text style={styles.brandSubLogo}>S T O R E</Text>
        </View>

        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#FF5E36" style={styles.spinner} />
          <Text style={styles.loadingText}>{message}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

