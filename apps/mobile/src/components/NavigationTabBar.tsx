import React from 'react';
import { StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import {
  LayoutDashboard,
  Shirt,
  BarChart3,
  FileText,
  Star
} from 'lucide-react-native';

export type TabType = 'dashboard' | 'catalogue' | 'analytics' | 'invoices' | 'reviews';

interface NavigationTabBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  tabValues: Record<TabType, Animated.Value>;
}

export default function NavigationTabBar({
  activeTab,
  setActiveTab,
  tabValues
}: NavigationTabBarProps) {
  const tabs: { key: TabType; label: string; Icon: React.ComponentType<any> }[] = [
    { key: 'dashboard', label: 'Overview', Icon: LayoutDashboard },
    { key: 'catalogue', label: 'Catalog', Icon: Shirt },
    { key: 'analytics', label: 'Analytics', Icon: BarChart3 },
    { key: 'invoices', label: 'Invoices', Icon: FileText },
    { key: 'reviews', label: 'Reviews', Icon: Star },
  ];

  return (
    <View style={styles.navigationFooter}>
      {tabs.map(({ key, label, Icon }) => {
        const animVal = tabValues[key];
        const isSelected = activeTab === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveTab(key)}
            style={styles.tabItem}
            accessibilityLabel={`${label} tab`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
          >
            <Animated.View
              style={[
                styles.iconWrapper,
                {
                  transform: [
                    {
                      translateY: animVal.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -6],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.activeIndicator,
                  {
                    opacity: animVal,
                    transform: [{ scale: animVal }],
                  },
                ]}
              />
              <View style={styles.iconPositioner}>
                <Icon size={18} color={isSelected ? '#FF5E36' : '#a1a1aa'} />
              </View>
            </Animated.View>
            <Animated.Text
              style={[
                styles.tabLabel,
                {
                  opacity: animVal,
                  transform: [
                    {
                      translateY: animVal.interpolate({
                        inputRange: [0, 1],
                        outputRange: [8, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {label}
            </Animated.Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navigationFooter: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff0ed',
  },
  iconPositioner: {
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF5E36',
    marginTop: 2,
  },
});
