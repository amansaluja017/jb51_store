import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs, useRouter, usePathname, type Href } from 'expo-router';
import { useAppDataContext } from '../../src/context/AppDataContext';
import AppHeader from '../../src/components/AppHeader';
import NavigationTabBar, { TabType } from '../../src/components/NavigationTabBar';

const ROUTE_TAB_MAP: Record<string, TabType> = {
  '/': 'dashboard',
  '/products-catalog': 'catalogue',
  '/stock': 'inventory',
  '/invoices': 'invoices',
  '/reviews': 'reviews',
};

const TAB_ROUTE_MAP: Record<TabType, Href> = {
  dashboard: '/',
  analytics: '/',
  catalogue: '/products-catalog',
  inventory: '/stock',
  invoices: '/invoices',
  reviews: '/reviews',
};

export default function TabLayout() {
  const data = useAppDataContext();
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = useMemo<TabType>(() => {
    return ROUTE_TAB_MAP[pathname] || data.activeTab || 'dashboard';
  }, [pathname, data.activeTab]);

  const handleTabChange = (newTab: TabType) => {
    data.setActiveTab(newTab);
    const targetRoute = TAB_ROUTE_MAP[newTab] || '/';
    router.replace(targetRoute);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        activeTab={currentTab}
        onOpenMenu={() => data.setDrawerMenuOpen(true)}
      />

      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={() => (
          <NavigationTabBar
            activeTab={currentTab}
            setActiveTab={handleTabChange}
            tabValues={data.tabValues}
          />
        )}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="products-catalog"
          options={{
            title: 'Catalog',
          }}
        />
        <Tabs.Screen
          name="stock"
          options={{
            title: 'Stock',
          }}
        />
        <Tabs.Screen
          name="invoices"
          options={{
            title: 'Invoices',
          }}
        />
        <Tabs.Screen
          name="reviews"
          options={{
            title: 'Reviews',
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

