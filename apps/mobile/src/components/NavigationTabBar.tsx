import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Animated,
  Platform,
} from 'react-native';
import {
  LayoutDashboard,
  Shirt,
  Package,
  FileText,
  Star,
} from 'lucide-react-native';

export type TabType = 'dashboard' | 'catalogue' | 'inventory' | 'analytics' | 'invoices' | 'reviews';

interface NavigationTabBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  tabValues?: Record<TabType, Animated.Value>;
}

export default function NavigationTabBar({
  activeTab,
  setActiveTab,
  tabValues,
}: NavigationTabBarProps) {
  // 5 core navigation tabs
  const tabs: { key: TabType; label: string; Icon: React.ComponentType<any> }[] = [
    { key: 'dashboard', label: 'Home', Icon: LayoutDashboard },
    { key: 'catalogue', label: 'Catalog', Icon: Shirt },
    { key: 'inventory', label: 'Stock', Icon: Package },
    { key: 'invoices', label: 'Invoices', Icon: FileText },
    { key: 'reviews', label: 'Reviews', Icon: Star },
  ];

  // Internal animated values if tabValues not provided
  const internalAnimValues = useRef<Record<string, Animated.Value>>({
    dashboard: new Animated.Value(activeTab === 'dashboard' || activeTab === 'analytics' ? 1 : 0),
    catalogue: new Animated.Value(activeTab === 'catalogue' ? 1 : 0),
    inventory: new Animated.Value(activeTab === 'inventory' ? 1 : 0),
    invoices: new Animated.Value(activeTab === 'invoices' ? 1 : 0),
    reviews: new Animated.Value(activeTab === 'reviews' ? 1 : 0),
  }).current;

  const anims = tabValues || (internalAnimValues as any);

  useEffect(() => {
    tabs.forEach(({ key }) => {
      const isSelected = key === 'dashboard'
        ? (activeTab === 'dashboard' || activeTab === 'analytics')
        : activeTab === key;

      if (anims[key]) {
        Animated.spring(anims[key], {
          toValue: isSelected ? 1 : 0,
          damping: 14,
          stiffness: 190,
          mass: 0.8,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [activeTab]);

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      <View style={styles.navBar}>
        <View style={styles.tabsRow}>
          {tabs.map(({ key, label, Icon }) => {
            const isSelected = key === 'dashboard'
              ? (activeTab === 'dashboard' || activeTab === 'analytics')
              : activeTab === key;
            const animVal = anims[key] || internalAnimValues[key];

            const translateY = animVal.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -12],
            });

            const scale = animVal.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.06],
            });

            const badgeScale = animVal.interpolate({
              inputRange: [0, 0.4, 1],
              outputRange: [0.2, 0.6, 1],
            });

            return (
              <TouchableOpacity
                key={key}
                onPress={() => setActiveTab(key)}
                style={styles.tabItem}
                activeOpacity={0.8}
                accessibilityLabel={`${label} tab`}
                accessibilityRole="tab"
                accessibilityState={{ selected: isSelected }}
              >
                {/* Popped Icon Container */}
                <Animated.View
                  style={[
                    styles.iconWrapper,
                    {
                      transform: [{ translateY }, { scale }],
                    },
                  ]}
                >
                  {/* Popped Circular Badge with brand accent color */}
                  <Animated.View
                    style={[
                      styles.popCircleBadge,
                      {
                        opacity: animVal,
                        transform: [{ scale: badgeScale }],
                      },
                    ]}
                  />

                  {/* Tab Icon */}
                  <View style={styles.iconCenter}>
                    <Icon
                      size={20}
                      color={isSelected ? '#ffffff' : '#64748b'}
                    />
                  </View>
                </Animated.View>

                {/* Grounded Tab Label */}
                <Text
                  numberOfLines={1}
                  style={[
                    styles.tabLabel,
                    isSelected && styles.tabLabelActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: Platform.OS === 'ios' ? 24 : 12,
    alignItems: 'center',
    zIndex: 99,
    overflow: 'visible',
  },
  navBar: {
    width: '100%',
    height: 64,
    backgroundColor: '#ffffff',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'visible',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    paddingHorizontal: 4,
    overflow: 'visible',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
    paddingVertical: 4,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  popCircleBadge: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FF5E36', // Signature brand coral orange
    shadowColor: '#FF5E36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  iconCenter: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: -0.2,
    marginTop: 2,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#FF5E36',
    fontWeight: '700',
  },
});

