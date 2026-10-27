import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, TouchableOpacity, StyleProp } from 'react-native';

export interface CardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  activeOpacity?: number;
}

export function Card({ children, style, onPress, activeOpacity = 0.7, ...props }: CardProps) {
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={[styles.card, style]}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

export function CardHeader({ children, style, ...props }: { children?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.cardHeader, style]} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({ children, style, ...props }: { children?: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Text style={[styles.cardTitle, style]} {...props}>
      {children}
    </Text>
  );
}

export function CardDescription({ children, style, ...props }: { children?: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Text style={[styles.cardDescription, style]} {...props}>
      {children}
    </Text>
  );
}

export function CardContent({ children, style, ...props }: { children?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.cardContent, style]} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ children, style, ...props }: { children?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.cardFooter, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f1f4',
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#09090b',
    letterSpacing: -0.2,
  },
  cardDescription: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 2,
  },
  cardContent: {
    width: '100%',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
  },
});
