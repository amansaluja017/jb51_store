import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs, useRouter, usePathname, type Href } from 'expo-router';
import { useAppDataContext } from '../../src/context/AppDataContext';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import AppHeader from '../../src/components/AppHeader';
import NavigationTabBar, { TabType } from '../../src/components/NavigationTabBar';
import { TAB_ROUTE_MAP, getTabFromPathname } from '../../src/utils/navigation';

function TabLayoutContent() {
  const data = useAppDataContext();
  const router = useRouter();
  const pathname = usePathname();

  // Derive current tab directly from pathname as single source of truth
  const currentTab = useMemo<TabType>(() => {
    return getTabFromPathname(pathname);
  }, [pathname]);

  const handleTabChange = (newTab: TabType) => {
    const targetRoute = TAB_ROUTE_MAP[newTab] || '/';
    router.replace(targetRoute as Href);
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

export default function TabLayout() {
  return (
    <ProtectedRoute>
      <TabLayoutContent />
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

