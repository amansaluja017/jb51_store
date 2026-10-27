import React, { createContext, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';

interface TabsContextValue {
  value: string;
  onValueChange: (val: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Tabs({ value, onValueChange, children, style }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <View style={[styles.tabs, style]}>{children}</View>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.tabsList, style]}>{children}</View>;
}

export interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  activeTextStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export function TabsTrigger({
  value,
  children,
  style,
  textStyle,
  activeTextStyle,
  icon,
}: TabsTriggerProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = ctx.value === value;

  const renderContent = () => {
    if (children === null || children === undefined || typeof children === 'boolean') {
      return null;
    }
    if (React.isValidElement(children)) {
      return children;
    }
    return (
      <Text
        style={[
          styles.triggerText,
          textStyle,
          isActive && [styles.triggerTextActive, activeTextStyle],
        ]}
      >
        {children}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      onPress={() => ctx.onValueChange(value)}
      activeOpacity={0.7}
      style={[
        styles.tabsTrigger,
        isActive && styles.tabsTriggerActive,
        style,
      ]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      {renderContent()}
    </TouchableOpacity>
  );
}

export function TabsContent({
  value,
  children,
  style,
}: {
  value: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent must be used within Tabs');

  if (ctx.value !== value) return null;

  return <View style={[styles.tabsContent, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  tabs: {
    width: '100%',
  },
  tabsList: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    padding: 3,
    borderRadius: 10,
    marginBottom: 10,
  },
  tabsTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  tabsTriggerActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  triggerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#71717a',
  },
  triggerTextActive: {
    fontWeight: '700',
    color: '#09090b',
  },
  iconWrap: {
    marginRight: 4,
  },
  tabsContent: {
    width: '100%',
  },
});
